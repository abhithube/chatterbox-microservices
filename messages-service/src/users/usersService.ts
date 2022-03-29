import { UserDto } from './interfaces';
import { UsersRepository } from './repositories';

export interface UsersService {
  createUser(userDto: UserDto): Promise<void>;
}

interface UsersServiceDeps {
  usersRepository: UsersRepository;
}

export function createUsersService({
  usersRepository,
}: UsersServiceDeps): UsersService {
  async function createUser({
    id,
    username,
    avatarUrl,
  }: UserDto): Promise<void> {
    await usersRepository.insertOne({
      id,
      username,
      avatarUrl,
    });
  }

  return {
    createUser,
  };
}
