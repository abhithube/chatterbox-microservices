import { BaseRepository, DbConnection, MongoClient } from '@chttrbx/common';
import { Message } from '../models';

export interface MessagesRepository extends BaseRepository<Message> {
  findManyByIndex(
    options: Omit<Partial<Message>, 'topicIndex'>,
    topicIndex?: number
  ): Promise<Message[]>;
}

interface MessagesRepositoryDeps {
  dbConnection: DbConnection<MongoClient>;
}

export function createMessagesRepository({
  dbConnection,
}: MessagesRepositoryDeps): MessagesRepository {
  const collection = dbConnection
    .getClient()
    .db()
    .collection<Message>('messages');

  async function insertOne(message: Message): Promise<Message> {
    await collection.insertOne(message);

    const result = await findOne({ id: message.id });

    return result!;
  }

  async function findManyByIndex(
    options: Omit<Partial<Message>, 'topicIndex'>,
    topicIndex?: number
  ): Promise<Message[]> {
    return collection
      .aggregate()
      .match({
        ...options,
        topicIndex: topicIndex ? { $lt: topicIndex } : { $gt: 0 },
      })
      .lookup({
        from: 'users',
        localField: 'user',
        foreignField: 'id',
        as: 'user',
      })
      .project<Message>({
        _id: 0,
        id: 1,
        topicIndex: 1,
        body: 1,
        topicId: 1,
        createdAt: 1,
        user: {
          $arrayElemAt: ['$user', 0],
        },
      })
      .sort({ topicIndex: -1 })
      .limit(50)
      .toArray();
  }

  async function findOne(options: Partial<Message>): Promise<Message | null> {
    return collection
      .aggregate()
      .match(options)
      .lookup({
        from: 'users',
        localField: 'user',
        foreignField: 'id',
        as: 'user',
      })
      .project<Message>({
        _id: 0,
        id: 1,
        topicIndex: 1,
        body: 1,
        topicId: 1,
        createdAt: 1,
        user: {
          $arrayElemAt: ['$user', 0],
        },
      })
      .sort({ topicIndex: -1 })
      .limit(1)
      .next();
  }

  async function updateOne(
    filterOptions: Partial<Message>,
    updateOptions: Partial<Message>
  ): Promise<Message | null> {
    await collection.updateOne(filterOptions, {
      $set: updateOptions,
    });

    return findOne(filterOptions);
  }

  async function deleteOne(options: Partial<Message>): Promise<Message | null> {
    await collection.deleteOne(options);

    return findOne(options);
  }

  async function deleteMany(options: Partial<Message>): Promise<void> {
    await collection.deleteMany(options);
  }

  return {
    insertOne,
    findManyByIndex,
    findOne,
    updateOne,
    deleteOne,
    deleteMany,
  };
}
