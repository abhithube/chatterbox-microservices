import { BaseRepository, DbConnection, MongoClient } from '@chttrbx/common';
import { User } from '../models';

export interface UsersRepository extends BaseRepository<User> {}

interface UsersRepositoryDeps {
  dbConnection: DbConnection<MongoClient>;
}

export function createUsersRepository({
  dbConnection,
}: UsersRepositoryDeps): UsersRepository {
  const collection = dbConnection.getClient().db().collection<User>('users');

  async function insertOne(user: User): Promise<User> {
    await collection.insertOne(user);

    return user;
  }

  async function findOne(options: Partial<User>): Promise<User | null> {
    return collection.findOne(options, {
      projection: {
        _id: 0,
      },
    });
  }

  async function updateOne(
    filterOptions: Partial<User>,
    updateOptions: Partial<User>
  ): Promise<User | null> {
    const result = await collection.findOneAndUpdate(
      filterOptions,
      {
        $set: updateOptions,
      },
      {
        projection: {
          _id: 0,
        },
        returnDocument: 'after',
      }
    );

    return result.value;
  }

  async function deleteOne(options: Partial<User>): Promise<User | null> {
    const result = await collection.findOneAndDelete(options, {
      projection: {
        _id: 0,
      },
    });

    return result.value;
  }

  async function deleteMany(options: Partial<User>): Promise<void> {
    await collection.deleteMany(options);
  }

  return {
    insertOne,
    findOne,
    updateOne,
    deleteOne,
    deleteMany,
  };
}
