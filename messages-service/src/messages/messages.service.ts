import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Message, Party, Topic } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { PartyConnectionDto } from './dto/party-connection.dto';
import { TopicConnectionDto } from './dto/topic-connection.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async verifyTopicConnection(
    { topicId }: TopicConnectionDto,
    userId: string,
  ): Promise<Topic> {
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

    return topic;
  }

  async verifyPartyConnection(
    { partyId }: PartyConnectionDto,
    userId: string,
  ): Promise<Party> {
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

    return party;
  }

  async createMessage(
    { body, topicId }: CreateMessageDto,
    userId: string,
  ): Promise<Message> {
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

    return this.prisma.message.create({
      data: {
        body,
        userId: user.id,
        topicId,
      },
    });
  }
}
