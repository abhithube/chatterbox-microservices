import { EntityRepository, MongoRepository } from 'typeorm';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';

export type UserFilterOptions = Partial<Pick<User, '_id' | 'id'>>;

@EntityRepository(User)
export class UserRepository extends MongoRepository<User> {
  async createUser(id: string): Promise<UserDto> {
    const user: UserDto = {
      id,
    };

    await this.insertOne({
      ...user,
    });

    return user;
  }

  async getUser(options: UserFilterOptions): Promise<UserDto> {
    return this.findOne(options);
  }

  async deleteUser(options: UserFilterOptions): Promise<boolean> {
    const { deletedCount } = await this.deleteOne(options);

    return deletedCount !== 0;
  }
}
