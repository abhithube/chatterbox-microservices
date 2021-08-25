import { EntityRepository, MongoRepository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import { User } from './user.entity';

export type UserFilterOptions = Partial<User>;

@EntityRepository(User)
export class UserRepository extends MongoRepository<User> {
  async createUser({ id }: CreateUserDto): Promise<UserDto> {
    const user: UserDto = {
      id,
    };

    await this.insertOne({ ...user });

    return user;
  }

  async getUser(options: UserFilterOptions): Promise<UserDto> {
    const docs = await this.aggregate<User>([
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
