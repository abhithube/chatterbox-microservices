import { User } from './user.entity';

export type UserFilterOptions = Partial<
  Pick<
    User,
    '_id' | 'id' | 'username' | 'email' | 'verificationToken' | 'resetToken'
  >
>;

export type UserDocument = Omit<User, '_id'>;

export type UserInsertOptions = Pick<
  User,
  | 'username'
  | 'email'
  | 'password'
  | 'avatarUrl'
  | 'verified'
  | 'verificationToken'
  | 'resetToken'
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
