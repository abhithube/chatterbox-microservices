import { KafkaService } from '@chttrbx/kafka';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
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
        publicId: userId,
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
            publicId: userId,
          },
        },
        topics: {
          create: {
            name: 'general',
          },
        },
      },
      include: {
        topics: true,
      },
    });

    const topic = party.topics[0];

    await this.kafka.publish<PartyCreatedDto>('parties', {
      key: party.id,
      value: {
        type: 'PARTY_CREATED',
        data: {
          party: {
            id: party.id,
            name: party.name,
          },
          topic: {
            id: topic.id,
            name: topic.name,
            partyId: topic.partyId,
          },
          userId,
        },
      },
    });

    return party;
  }

  async getAllParties(): Promise<PartyDto[]> {
    const parties = await this.prisma.party.findMany({
      where: {
        visible: true,
      },
    });

    return parties.map(({ id, name }) => ({
      id,
      name,
    }));
  }

  async getUserParties(userId: string): Promise<PartyDto[]> {
    const parties = await this.prisma.party.findMany({
      where: {
        users: {
          some: {
            publicId: userId,
          },
        },
      },
    });

    return parties.map(({ id, name }) => ({
      id,
      name,
    }));
  }

  async getParty(id: string): Promise<PartyWithUsersAndTopicsDto> {
    const party = await this.prisma.party.findUnique({
      where: {
        id,
      },
      include: {
        users: true,
        topics: true,
      },
    });
    if (!party) {
      throw new NotFoundException({
        message: 'Party not found',
      });
    }

    return {
      id: party.id,
      name: party.name,
      inviteToken: party.inviteToken,
      users: party.users.map(({ publicId, username, avatarUrl }) => ({
        id: publicId,
        username,
        avatarUrl,
      })),
      topics: party.topics.map(({ id, name, partyId }) => ({
        id,
        name,
        partyId,
      })),
    };
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
        publicId: userId,
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

    await this.kafka.publish<MemberDto>('parties', {
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

  async leaveParty(
    { id, users }: PartyWithUsersAndTopicsDto,
    userId: string,
  ): Promise<void> {
    if (users.length === 1) {
      throw new ForbiddenException({
        message: 'Party must have at least one member',
      });
    }

    await this.prisma.party.update({
      where: {
        id,
      },
      data: {
        users: {
          disconnect: {
            publicId: userId,
          },
        },
      },
    });

    await this.kafka.publish<MemberDto>('parties', {
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

  async deleteParty(id: string): Promise<void> {
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

    await this.kafka.publish<Pick<PartyDto, 'id'>>('parties', {
      key: id,
      value: {
        type: 'PARTY_DELETED',
        data: {
          id,
        },
      },
    });
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
    });

    const topicDto: TopicDto = {
      id: topic.id,
      name: topic.name,
      partyId: topic.partyId,
    };

    await this.kafka.publish<TopicDto>('parties', {
      key: partyId,
      value: {
        type: 'TOPIC_CREATED',
        data: topicDto,
      },
    });

    return topicDto;
  }

  async deleteTopic(id: string): Promise<void> {
    const topic = await this.prisma.topic.findUnique({
      where: {
        id,
      },
    });
    if (!topic) {
      throw new NotFoundException({
        message: 'Topic not found',
      });
    }

    await this.prisma.topic.delete({
      where: {
        id,
      },
    });

    await this.kafka.publish<Pick<TopicDto, 'id'>>('parties', {
      key: topic.partyId,
      value: {
        type: 'TOPIC_DELETED',
        data: {
          id,
        },
      },
    });
  }
}
