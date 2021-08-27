import { randomUUID } from 'crypto';
import { EntityRepository, MongoRepository } from 'typeorm';
import {
  UserDocument,
  UserFilterOptions,
  UserInsertOptions,
  UserUpdateOptions,
} from './db';
import { User } from './user.entity';

@EntityRepository(User)
export class UserRepository extends MongoRepository<User> {
  async createUser(options: UserInsertOptions): Promise<UserDocument> {
    const user: UserDocument = {
      ...options,
      id: randomUUID(),
    };

    await this.insertOne({ ...user });

    return user;
  }

  async getUser(options: UserFilterOptions): Promise<UserDocument> {
    const docs = await this.aggregate<UserDocument>([
      { $match: options },
      { $project: { _id: 0 } },
      { $limit: 1 },
    ]).toArray();

    const user = docs[0];
    return user;
  }

  async updateUser(
    filterOptions: UserFilterOptions,
    updateOptions: UserUpdateOptions,
  ): Promise<UserDocument> {
    const user = await this.getUser(filterOptions);

    await this.updateOne({ id: user.id }, { $set: updateOptions });

    return {
      ...user,
      ...updateOptions,
    };
  }

  async deleteUser(options: UserFilterOptions): Promise<boolean> {
    const { deletedCount } = await this.deleteOne(options);

    return deletedCount !== 0;
  }
}
