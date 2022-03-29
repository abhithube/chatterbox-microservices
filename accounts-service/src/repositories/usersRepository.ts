import { MongoClient } from 'mongodb';
import { User } from '../models';

export interface UsersRepository {
  insertOne(user: User): Promise<User>;
  findOne(options: Partial<User>): Promise<User | null>;
  deleteMany(): Promise<void>;
}

interface UsersRepositoryDeps {
  dbClient: MongoClient;
}

export function createUsersRepository({
  dbClient,
}: UsersRepositoryDeps): UsersRepository {
  const collection = dbClient.db().collection<User>('users');

  collection.createIndex('id', {
    unique: true,
  });

  async function insertOne(user: User): Promise<User> {
    await collection.insertOne({
      ...user,
    });

    return user;
  }

  async function findOne(options: Partial<User>): Promise<User | null> {
    return collection.findOne(options, {
      projection: {
        _id: 0,
      },
    });
  }

  async function deleteMany(): Promise<void> {
    await collection.deleteMany({});
  }

  return {
    insertOne,
    findOne,
    deleteMany,
  };
}
