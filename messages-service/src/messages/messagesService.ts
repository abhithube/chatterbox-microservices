import { CurrentUser, RandomGenerator } from '@chttrbx/common';
import { CreateMessageDto } from './dto';
import { MessagesRepository } from './repositories';
import { MessageWithUser } from './types';

export interface MessagesService {
  createMessage(
    createMessageDto: CreateMessageDto,
    topicId: string,
    user: CurrentUser
  ): Promise<MessageWithUser>;
  getMessages(topicId: string, topicIndex?: number): Promise<MessageWithUser[]>;
}

interface MessagesServiceDeps {
  messagesRepository: MessagesRepository;
  randomGenerator: RandomGenerator;
}

export function createMessagesService({
  messagesRepository,
  randomGenerator,
}: MessagesServiceDeps): MessagesService {
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
    topicIndex?: number
  ): Promise<MessageWithUser[]> {
    return messagesRepository.findManyByTopicIdAndTopicIndex(
      topicId,
      topicIndex
    );
  }

  return {
    createMessage,
    getMessages,
  };
}
