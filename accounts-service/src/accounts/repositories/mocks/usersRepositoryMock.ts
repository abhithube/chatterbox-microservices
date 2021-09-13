import { BaseRepository } from '@chttrbx/common';
import { User } from '../../models';

export const MOCK_VERIFIED_USER: User = {
  id: 'id',
  username: 'username',
  email: 'email',
  password: 'password',
  avatarUrl: null,
  verified: true,
  verificationToken: null,
  resetToken: 'reset',
};

export const MOCK_UNVERIFIED_USER: User = {
  ...MOCK_VERIFIED_USER,
  verified: false,
  verificationToken: 'verification',
};

export const createUsersRepositoryMock = (): BaseRepository<User> => ({
  insertOne: () => Promise.resolve(MOCK_UNVERIFIED_USER),
  findOne: () => Promise.resolve(MOCK_VERIFIED_USER),
  updateOne: () => Promise.resolve(MOCK_VERIFIED_USER),
  deleteOne: () => Promise.resolve(MOCK_VERIFIED_USER),
  deleteMany: () => Promise.resolve(),
});