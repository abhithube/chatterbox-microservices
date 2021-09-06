import { UserDocument } from '../../models';
import { UsersRepository } from '../usersRepository';

export const MOCK_VERIFIED_USER: UserDocument = {
  id: '1',
  username: 'testuser',
  email: 'testemail',
  password: 'hashed',
  avatarUrl: null,
  verified: true,
  verificationToken: null,
  resetToken: 'reset',
};

export const MOCK_UNVERIFIED_USER: UserDocument = {
  ...MOCK_VERIFIED_USER,
  verified: false,
  verificationToken: 'verification',
};

export const createUsersRepositoryMock = (): UsersRepository => ({
  insertOne: () => Promise.resolve(MOCK_UNVERIFIED_USER),
  findOne: () => Promise.resolve(MOCK_VERIFIED_USER),
  updateOne: () => Promise.resolve(MOCK_VERIFIED_USER),
  deleteOne: () => Promise.resolve(MOCK_VERIFIED_USER),
  deleteMany: () => Promise.resolve(),
});
