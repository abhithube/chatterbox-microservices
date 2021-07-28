import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { PrismaClient } from '@prisma/client';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageDto } from './dto/message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaClient) {}

  async validatePartyConnection(
    partyId: string,
    userId: string,
  ): Promise<void> {
    const party = await this.prisma.party.findUnique({
      where: {
        id: partyId,
      },
    });
    if (!party) {
      throw new WsException('Party not found');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        sub: userId,
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
        id: topicId,
      },
    });
    if (!topic) {
      throw new WsException('Topic not found');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        sub: userId,
      },
    });
    if (!user) {
      throw new WsException('User not found');
    }

    if (!user.partyIDs.includes(topic.partyId)) {
      throw new WsException('Not a member');
    }
  }

  async createMessage(
    { body, topicId }: CreateMessageDto,
    userId: string,
  ): Promise<MessageDto> {
    const topic = await this.prisma.topic.findUnique({
      where: {
        id: topicId,
      },
    });
    if (!topic) {
      throw new WsException('Topic not found');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        sub: userId,
      },
    });
    if (!user) {
      throw new WsException('User not found');
    }

    if (!user.partyIDs.includes(topic.partyId)) {
      throw new WsException('Not a member');
    }

    const prev = await this.prisma.message.findFirst({
      where: {
        topicId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return this.prisma.message.create({
      data: {
        body,
        syncId: prev ? prev.syncId + 1 : 1,
        userId: user.id,
        topicId,
      },
      select: {
        id: true,
        body: true,
        syncId: true,
        user: true,
        topicId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
