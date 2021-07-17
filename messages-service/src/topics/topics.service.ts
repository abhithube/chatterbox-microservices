import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Topic } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTopicDto } from './dto/create-topic.dto';

@Injectable()
export class TopicsService {
  constructor(
    private prisma: PrismaService,
    @Inject('TOPICS_CLIENT') private client: ClientKafka,
  ) {}

  async getTopic(id: number): Promise<Topic> {
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

    return topic;
  }

  async createTopic(
    { name, partyId }: CreateTopicDto,
    userId: string,
  ): Promise<Topic> {
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

    const member = await this.prisma.member.findUnique({
      where: {
        userId_partyId: {
          userId: user.id,
          partyId,
        },
      },
    });
    if (!member) {
      throw new ForbiddenException({
        message: 'Not a member',
      });
    }

    const topic = await this.prisma.topic.create({
      data: {
        name,
        partyId,
      },
    });

    this.client.emit('topics', {
      type: 'TOPIC_CREATED',
      data: topic,
    });

    return topic;
  }

  async deleteTopic(id: number, userId: string): Promise<Topic> {
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

    const member = await this.prisma.member.findUnique({
      where: {
        userId_partyId: {
          userId: user.id,
          partyId: topic.partyId,
        },
      },
    });
    if (!member) {
      throw new ForbiddenException({
        message: 'Not a member',
      });
    }

    await this.prisma.topic.delete({
      where: {
        id,
      },
    });

    this.client.emit('topics', {
      type: 'TOPIC_DELETED',
      data: topic,
    });

    return topic;
  }
}
