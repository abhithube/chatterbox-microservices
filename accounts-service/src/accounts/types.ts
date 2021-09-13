import { User } from './models';

export type UserFilterOptions = Partial<
  Pick<User, 'id' | 'username' | 'email' | 'verificationToken' | 'resetToken'>
>;

export type UserUpdateOptions = Partial<
  Pick<
    User,
    | 'username'
    | 'avatarUrl'
    | 'password'
    | 'verified'
    | 'verificationToken'
    | 'resetToken'
  >
>;
