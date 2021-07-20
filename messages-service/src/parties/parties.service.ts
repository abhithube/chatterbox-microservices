import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Party } from '@prisma/client';
import { MessageDto } from 'src/messages/dto/message.dto';
import { UserDto } from 'src/users/dto/user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartyDto } from './dto/create-party.dto';
import { CreateTopicDto } from './dto/create-topic.dto';
import { PartyWithUsersAndTopicsDto } from './dto/party-with-users-and-topics.dto';
import { PartyDto } from './dto/party.dto';
import { TopicDto } from './dto/topic.dto';

@Injectable()
export class PartiesService {
  constructor(
    private prisma: PrismaService,
    @Inject('PARTIES_CLIENT') private partiesClient: ClientKafka,
    @Inject('TOPICS_CLIENT') private topicsClient: ClientKafka,
  ) {}

  async getAllParties(userId: string): Promise<PartyDto[]> {
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
        createdAt: true,
        updatedAt: true,
        users: {
          select: {
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

    const users: UserDto[] = party.users.map((user) => ({
      id: user.sub,
      username: user.username,
      avatarUrl: user.avatarUrl,
    }));

    return {
      ...party,
      users,
    };
  }

  async getMessages(
    topicId: string,
    take: number,
    syncId: number,
  ): Promise<MessageDto[]> {
    const topic = await this.prisma.topic.findUnique({
      where: {
        id: topicId,
      },
    });
    if (!topic) {
      throw new NotFoundException({
        message: 'Topic not found',
      });
    }

    const messages = await this.prisma.message.findMany({
      where: {
        topicId,
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
      take,
      cursor: {
        syncId,
      },
      orderBy: {
        syncId: 'asc',
      },
    });

    messages.forEach((message) => {
      message.user.id = message.user.sub;
      delete message.user.sub;
    });

    return messages;
  }

  async createParty(
    { name }: CreatePartyDto,
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
      include: {
        users: true,
        topics: true,
      },
    });

    this.partiesClient.emit('parties', {
      type: 'PARTY_CREATED',
      data: party,
    });

    return {
      id: party.id,
      name: party.name,
      createdAt: party.createdAt,
      updatedAt: party.updatedAt,
    };
  }

  async createTopic(
    { name }: CreateTopicDto,
    userId: string,
    partyId: string,
  ): Promise<TopicDto> {
    const party = await this.prisma.party.findUnique({
      where: {
        id: partyId,
      },
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

    if (!user.partyIDs.includes(partyId)) {
      throw new ForbiddenException({
        message: 'Not a member',
      });
    }

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

    this.topicsClient.emit('topics', {
      type: 'TOPIC_CREATED',
      data: topic,
    });

    return topic;
  }

  async joinParty(id: string, userId: string): Promise<Party> {
    let party = await this.prisma.party.findUnique({
      where: {
        id,
      },
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

    party = await this.prisma.party.update({
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

    this.partiesClient.emit('parties', {
      type: 'PARTY_JOINED',
      data: party,
    });

    return party;
  }

  async leaveParty(id: string, userId: string): Promise<Party> {
    const party = await this.prisma.party.findUnique({
      where: {
        id,
      },
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

    if (!user.partyIDs.includes(id)) {
      throw new ForbiddenException({
        message: 'Not a member',
      });
    }

    this.prisma.party.update({
      where: {
        id,
      },
      data: {
        users: {
          disconnect: {
            id: user.id,
          },
        },
      },
    });

    this.partiesClient.emit('parties', {
      type: 'PARTY_JOINED',
      data: party,
    });

    return party;
  }

  async deleteParty(id: string, userId: string): Promise<PartyDto> {
    const party = await this.prisma.party.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
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

    if (!user.partyIDs.includes(id)) {
      throw new ForbiddenException({
        message: 'Not a member',
      });
    }

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

    this.partiesClient.emit('parties', {
      type: 'PARTY_DELETED',
      data: party,
    });

    return party;
  }

  async deleteTopic(
    id: string,
    userId: string,
    partyId: string,
  ): Promise<TopicDto> {
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

    if (!user.partyIDs.includes(partyId)) {
      throw new ForbiddenException({
        message: 'Not a member',
      });
    }

    await this.prisma.topic.delete({
      where: {
        id,
      },
    });

    this.topicsClient.emit('topics', {
      type: 'TOPIC_DELETED',
      data: topic,
    });

    return topic;
  }
}
