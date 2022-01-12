import { User } from './models';

export type UserFilterOptions = Partial<
  Pick<User, 'id' | 'username' | 'email'>
>;

export type UserUpdateOptions = Partial<Pick<User, 'username' | 'avatarUrl'>>;
