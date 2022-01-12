import { User } from '../../models';
import { UsersRepository } from '../usersRepository';

export const MOCK_USER: User = {
  id: 'id',
  username: 'username',
  email: 'email',
  avatarUrl: null,
};

export const createUsersRepositoryMock = (): UsersRepository => ({
  insertOne: () => Promise.resolve(MOCK_USER),
  findOne: () => Promise.resolve(MOCK_USER),
  updateOne: () => Promise.resolve(MOCK_USER),
  deleteOne: () => Promise.resolve(MOCK_USER),
  deleteMany: () => Promise.resolve(),
});
