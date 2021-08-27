import { randomUUID } from 'crypto';
import { EntityRepository, MongoRepository } from 'typeorm';
import { MessageDocument, MessageInsertOptions } from './db';
import { Message } from './message.entity';

@EntityRepository(Message)
export class MessageRepository extends MongoRepository<Message> {
  async createMessage({
    topicIndex,
    body,
    topicId,
    user,
  }: MessageInsertOptions): Promise<MessageDocument> {
    const message: MessageDocument = {
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

  async getLatestMessage(topicId: string): Promise<MessageDocument> {
    const docs = await this.aggregate<MessageDocument>([
      { $match: { topicId } },
      { $project: { _id: 0, topicId: 0 } },
      { $sort: { topicIndex: -1 } },
      { $limit: 1 },
    ]).toArray();

    const message = docs[0];
    return message;
  }

  async getMessagesByTopicId(
    topicId: string,
    topicIndex?: number,
  ): Promise<MessageDocument[]> {
    const options = {
      topicId,
      topicIndex: topicIndex ? { $lt: topicIndex } : { $gt: 0 },
    };

    return this.aggregate<MessageDocument>([
      { $match: options },
      { $project: { _id: 0, topicId: 0 } },
      { $sort: { topicIndex: -1 } },
      { $limit: 50 },
    ]).toArray();
  }
}
