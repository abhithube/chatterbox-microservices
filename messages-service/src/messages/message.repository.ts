import { AuthUser } from '@chttrbx/jwt';
import { randomUUID } from 'crypto';
import { EntityRepository, MongoRepository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageDto } from './dto/message.dto';
import { Message } from './message.entity';

@EntityRepository(Message)
export class MessageRepository extends MongoRepository<Message> {
  async createMessage(
    { body }: CreateMessageDto,
    topicIndex: number,
    topicId: string,
    user: AuthUser,
  ): Promise<MessageDto> {
    const message: MessageDto = {
      id: randomUUID(),
      topicIndex,
      body,
      user,
      createdAt: new Date(),
    };

    await this.insertOne({
      ...message,
      topicId,
    });

    return message;
  }

  async getLatestMessage(topicId: string): Promise<MessageDto> {
    const docs = await this.aggregate<MessageDto>([
      { $match: { topicId } },
      { $sort: { topicIndex: -1 } },
      { $limit: 1 },
    ]).toArray();

    const message = docs[0];
    return message;
  }

  async getMessagesByTopicId(
    topicId: string,
    topicIndex?: number,
  ): Promise<MessageDto[]> {
    const options = {
      topicId,
      topicIndex: topicIndex ? { $lt: topicIndex } : { $gt: 0 },
    };

    return this.aggregate<MessageDto>([
      { $match: options },
      { $project: { _id: 0, topicId: 0 } },
      { $sort: { topicIndex: -1 } },
      { $limit: 50 },
    ]).toArray();
  }
}
