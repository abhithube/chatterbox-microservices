import {
  CurrentUser,
  ForbiddenException,
  RandomGenerator,
} from '@chttrbx/common';
import { MembersRepository, TopicsRepository } from '../parties/repositories';
import { CreateMessageDto } from './dto';
import { MessagesRepository } from './repositories';
import { MessageWithUser } from './types';

export interface MessagesService {
  validatePartyConnection(id: string, user: CurrentUser): Promise<void>;
  validateTopicConnection(
    id: string,
    partyId: string,
    user: CurrentUser
  ): Promise<void>;
  createMessage(
    createMessageDto: CreateMessageDto,
    topicId: string,
    user: CurrentUser
  ): Promise<MessageWithUser>;
  getMessages(
    topicId: string,
    partyId: string,
    userId: string,
    topicIndex?: number
  ): Promise<MessageWithUser[]>;
}

interface MessagesServiceDeps {
  messagesRepository: MessagesRepository;
  membersRepository: MembersRepository;
  topicsRepository: TopicsRepository;
  randomGenerator: RandomGenerator;
}

export function createMessagesService({
  messagesRepository,
  membersRepository,
  topicsRepository,
  randomGenerator,
}: MessagesServiceDeps): MessagesService {
  async function validatePartyConnection(
    id: string,
    user: CurrentUser
  ): Promise<void> {
    const member = await membersRepository.findOne(user.id, id);

    if (!member) {
      throw new Error('Not a member');
    }
  }

  async function validateTopicConnection(id: string): Promise<void> {
    const topic = await topicsRepository.findOne(id);

    if (!topic) {
      throw new Error('Topic not found');
    }
  }

  async function createMessage(
    { body }: CreateMessageDto,
    topicId: string,
    { id: userId }: CurrentUser
  ): Promise<MessageWithUser> {
    const latest = await messagesRepository.findOneByTopicIdAndDate(topicId);

    const id = randomGenerator.generate();

    await messagesRepository.insertOne({
      id,
      topicIndex: (latest?.topicIndex || 0) + 1,
      body,
      topicId,
      userId,
    });

    const message = await messagesRepository.findOne(id);
    if (!message) {
      throw new Error('Something went wrong');
    }

    return message;
  }

  async function getMessages(
    topicId: string,
    partyId: string,
    userId: string,
    topicIndex?: number
  ): Promise<MessageWithUser[]> {
    const member = await membersRepository.findOne(userId, partyId);

    if (!member) {
      throw new ForbiddenException('Not a member');
    }

    return messagesRepository.findManyByTopicIdAndTopicIndex(
      topicId,
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
