import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { KafkaService } from '../kafka/kafka.service';
import { MessageDto } from '../messages/dto/message.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartyDto } from './dto/create-party.dto';
import { CreateTopicDto } from './dto/create-topic.dto';
import { MemberDto } from './dto/member.dto';
import { PartyCreatedDto } from './dto/party-created.dto';
import { PartyWithUsersAndTopicsDto } from './dto/party-with-users-and-topics.dto';
import { PartyDto } from './dto/party.dto';
import { TopicDto } from './dto/topic.dto';

@Injectable()
export class PartiesService {
  constructor(private prisma: PrismaService, private kafka: KafkaService) {}

  async createParty(
    { name, visible }: CreatePartyDto,
    userId: string,
  ): Promise<PartyDto> {
    const user = await this.prisma.user.findUnique({
      where: {
        sub: userId,
      },
    });

    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
      });
    }

    const party = await this.prisma.party.create({
      data: {
        name,
        visible,
        inviteToken: randomUUID(),
        users: {
          connect: {
            sub: userId,
          },
        },
        topics: {
          create: {
            name: 'general',
          },
        },
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        topics: {
          select: {
            id: true,
            name: true,
            partyId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    const topic = party.topics[0];

    delete party.topics;

    await this.kafka.publish<PartyCreatedDto>('messages', {
      key: party.id,
      value: {
        type: 'PARTY_CREATED',
        data: {
          party,
          topic,
          userId,
        },
      },
    });

    return party;
  }

  async getAllParties(): Promise<PartyDto[]> {
    return this.prisma.party.findMany({
      where: {
        visible: true,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getUserParties(userId: string): Promise<PartyDto[]> {
    return this.prisma.party.findMany({
      where: {
        users: {
          some: {
            sub: userId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getParty(id: string): Promise<PartyWithUsersAndTopicsDto> {
    const party = await this.prisma.party.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        inviteToken: true,
        createdAt: true,
        updatedAt: true,
        users: {
          select: {
            id: true,
            sub: true,
            username: true,
            avatarUrl: true,
          },
        },
        topics: {
          select: {
            id: true,
            name: true,
            partyId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
    if (!party) {
      throw new NotFoundException({
        message: 'Party not found',
      });
    }

    party.users.map((user) => {
      user.id = user.sub;
      delete user.sub;
    });

    return party;
  }

  async joinParty(id: string, userId: string, token?: string): Promise<void> {
    const where: Prisma.PartyWhereUniqueInput = token
      ? {
          inviteToken: token,
        }
      : {
          id,
        };

    const party = await this.prisma.party.findUnique({
      where,
    });

    if (!party) {
      throw new NotFoundException({
        message: 'Party not found',
      });
    }

    const user = await this.prisma.user.findUnique({
      where: {
        sub: userId,
      },
    });
    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
      });
    }

    if (user.partyIDs.includes(id)) {
      throw new ForbiddenException({
        message: 'Already a member',
      });
    }

    if (!party.visible && !token) {
      throw new ForbiddenException({
        message: 'Cannot join private party without invite',
      });
    }

    await this.prisma.party.update({
      where: {
        id,
      },
      data: {
        users: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    await this.kafka.publish<MemberDto>('messages', {
      key: id,
      value: {
        type: 'MEMBER_CREATED',
        data: {
          userId,
          partyId: id,
        },
      },
    });
  }

  async leaveParty(id: string, userId: string): Promise<void> {
    await this.prisma.party.update({
      where: {
        id,
      },
      data: {
        users: {
          disconnect: {
            sub: userId,
          },
        },
      },
    });

    await this.kafka.publish<MemberDto>('messages', {
      key: id,
      value: {
        type: 'MEMBER_DELETED',
        data: {
          userId,
          partyId: id,
        },
      },
    });
  }

  async deleteParty({
    id,
    name,
    createdAt,
    updatedAt,
  }: PartyWithUsersAndTopicsDto): Promise<PartyDto> {
    await this.prisma.$transaction([
      this.prisma.party.delete({
        where: {
          id,
        },
      }),
      this.prisma.topic.deleteMany({
        where: {
          partyId: id,
        },
      }),
    ]);

    const partyDto = {
      id,
      name,
      createdAt,
      updatedAt,
    };

    await this.kafka.publish<Pick<PartyDto, 'id'>>('messages', {
      key: id,
      value: {
        type: 'PARTY_DELETED',
        data: {
          id,
        },
      },
    });

    return partyDto;
  }

  async createTopic(
    { name }: CreateTopicDto,
    partyId: string,
  ): Promise<TopicDto> {
    const topic = await this.prisma.topic.create({
      data: {
        name,
        partyId,
      },
      select: {
        id: true,
        name: true,
        partyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await this.kafka.publish<TopicDto>('messages', {
      key: partyId,
      value: {
        type: 'TOPIC_CREATED',
        data: topic,
      },
    });

    return topic;
  }

  async getTopicMessages(
    topicId: string,
    syncId?: number,
  ): Promise<MessageDto[]> {
    if (!syncId) {
      const last = await this.prisma.message.findFirst({
        where: {
          topicId,
        },
        orderBy: {
          syncId: 'desc',
        },
      });

      if (!last) return [];

      syncId = last.syncId + 1;
    }

    const messages = await this.prisma.message.findMany({
      where: {
        topicId,
        syncId: {
          lt: syncId,
        },
      },
      select: {
        id: true,
        syncId: true,
        body: true,
        user: {
          select: {
            id: true,
            sub: true,
            username: true,
            avatarUrl: true,
          },
        },
        topicId: true,
        createdAt: true,
        updatedAt: true,
      },
      take: 50,
      orderBy: {
        syncId: 'desc',
      },
    });

    messages.forEach((message) => {
      message.user.id = message.user.sub;
      delete message.user.sub;
    });

    return messages;
  }

  async deleteTopic(id: string): Promise<TopicDto> {
    const topic = await this.prisma.topic.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        partyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!topic) {
      throw new NotFoundException({
        message: 'Topic not found',
      });
    }

    await this.prisma.$transaction([
      this.prisma.topic.delete({
        where: {
          id,
        },
      }),
      this.prisma.message.deleteMany({
        where: {
          topicId: id,
        },
      }),
    ]);

    await this.kafka.publish<Pick<TopicDto, 'id'>>('messages', {
      key: topic.partyId,
      value: {
        type: 'TOPIC_DELETED',
        data: {
          id,
        },
      },
    });

    return topic;
  }
}
