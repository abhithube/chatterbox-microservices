import { EntityRepository, MongoRepository } from 'typeorm';
import { UserDocument, UserFilterOptions, UserInsertOptions } from './db';
import { User } from './user.entity';

@EntityRepository(User)
export class UserRepository extends MongoRepository<User> {
  async createUser({ id }: UserInsertOptions): Promise<UserDocument> {
    const user: UserDocument = {
      id,
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

  async deleteUser(options: UserFilterOptions): Promise<boolean> {
    const { deletedCount } = await this.deleteOne(options);

    return deletedCount !== 0;
  }
}
