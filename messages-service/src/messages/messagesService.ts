import {
  CurrentUser,
  ForbiddenException,
  NotFoundException,
} from '@chttrbx/common';
import { randomUUID } from 'crypto';
import { PartiesService } from '../parties/partiesService';
import { CreateMessageDto } from './dto';
import { Message } from './models';
import { MessagesRepository } from './repositories';

export interface MessagesService {
  validatePartyConnection(id: string, userId: string): Promise<void>;
  validateTopicConnection(id: string, partyId: string): Promise<void>;
  createMessage(
    createMessageDto: CreateMessageDto,
    topicId: string,
    user: CurrentUser
  ): Promise<Message>;
  getMessages(
    topicId: string,
    partyId: string,
    userId: string,
    topicIndex?: number
  ): Promise<Message[]>;
}

interface MessagesServiceDeps {
  partiesService: PartiesService;
  messagesRepository: MessagesRepository;
}

export function createMessagesService({
  messagesRepository,
  partiesService,
}: MessagesServiceDeps): MessagesService {
  async function validatePartyConnection(
    id: string,
    userId: string
  ): Promise<void> {
    try {
      const party = await partiesService.getParty(id);

      if (!party.members.includes(userId)) {
        throw new Error('Not a member');
      }
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new Error('Party not found');
      }
    }
  }

  async function validateTopicConnection(
    id: string,
    partyId: string
  ): Promise<void> {
    try {
      const party = await partiesService.getParty(partyId);

      if (!party.topics.find((topic) => topic.id === id)) {
        throw new Error('Topic not found');
      }
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new Error('Party not found');
      }
    }
  }

  async function createMessage(
    { body }: CreateMessageDto,
    topicId: string,
    user: CurrentUser
  ): Promise<Message> {
    const latest = await messagesRepository.findOne({ topicId });

    const message: Message = {
      id: randomUUID(),
      topicIndex: (latest?.topicIndex || 0) + 1,
      body,
      topicId,
      user: user.id,
      createdAt: new Date(),
    };

    return messagesRepository.insertOne(message);
  }

  async function getMessages(
    topicId: string,
    partyId: string,
    userId: string,
    topicIndex?: number
  ): Promise<Message[]> {
    try {
      const party = await partiesService.getParty(partyId);

      if (!party.members.includes(userId)) {
        throw new ForbiddenException('Not a member');
      }
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new NotFoundException('Topic not found');
      }
    }

    return messagesRepository.findManyByIndex(
      {
        topicId,
      },
      topicIndex
    );
  }

  return {
    validatePartyConnection,
    validateTopicConnection,
    createMessage,
    getMessages,
  };
}
