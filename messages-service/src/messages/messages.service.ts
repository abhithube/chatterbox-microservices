import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageDto } from './dto/message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async validatePartyConnection(
    partyId: string,
    userId: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: {
        publicId: userId,
      },
    });
    if (!user) {
      throw new WsException('User not found');
    }

    if (!user.partyIDs.includes(partyId)) {
      throw new WsException('Not a member');
    }
  }

  async validateTopicConnection(
    topicId: string,
    userId: string,
  ): Promise<void> {
    const topic = await this.prisma.topic.findUnique({
      where: {
        publicId: topicId,
      },
    });
    if (!topic) {
      throw new WsException('Topic not found');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        publicId: userId,
      },
    });
    if (!user) {
      throw new WsException('User not found');
    }
  }

  async createMessage(
    { body, topicId }: CreateMessageDto,
    userId: string,
  ): Promise<MessageDto> {
    const topic = await this.prisma.topic.findUnique({
      where: {
        publicId: topicId,
      },
    });
    if (!topic) {
      throw new WsException('Topic not found');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        publicId: userId,
      },
    });
    if (!user) {
      throw new WsException('User not found');
    }

    const prev = await this.prisma.message.findFirst({
      where: {
        topicId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const message = await this.prisma.message.create({
      data: {
        body,
        syncId: prev ? prev.syncId + 1 : 1,
        userId: user.id,
        topicId,
      },
      include: {
        user: true,
      },
    });

    return {
      id: message.id,
      body: message.body,
      syncId: message.syncId,
      user: {
        id: message.user.publicId,
        username: message.user.username,
        avatarUrl: message.user.avatarUrl,
      },
      createdAt: message.createdAt,
    };
  }

  async getMessages(
    topicId: string,
    userId: string,
    syncId?: number,
  ): Promise<MessageDto[]> {
    const topic = await this.prisma.topic.findUnique({
      where: {
        publicId: topicId,
      },
    });
    if (!topic) {
      throw new NotFoundException({
        message: 'Topic not found',
      });
    }

    const user = await this.prisma.user.findUnique({
      where: {
        publicId: userId,
      },
    });
    if (!user.partyIDs.includes(topic.partyId)) {
      throw new ForbiddenException({
        message: 'Not a member',
      });
    }

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
      include: {
        user: true,
      },
      take: 50,
      orderBy: {
        syncId: 'desc',
      },
    });

    return messages.map((message) => ({
      id: message.id,
      body: message.body,
      syncId: message.syncId,
      user: {
        id: message.user.publicId,
        username: message.user.username,
        avatarUrl: message.user.avatarUrl,
      },
      createdAt: message.createdAt,
    }));
  }
}
