import { PasswordHasher } from '../PasswordHasher';

export const createPasswordHasherMock = (): PasswordHasher => ({
  hash: () => Promise.resolve('hashed'),
  hashSync: () => 'hashed',
  compare: () => Promise.resolve(true),
  compareSync: () => true,
});
