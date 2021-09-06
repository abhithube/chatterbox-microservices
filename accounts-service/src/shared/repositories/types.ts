import { UserDocument } from '../models';

export type UserFilterOptions = Partial<
  Pick<
    UserDocument,
    'id' | 'username' | 'email' | 'verificationToken' | 'resetToken'
  >
>;

export type UserInsertOptions = Pick<
  UserDocument,
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
    UserDocument,
    | 'username'
    | 'avatarUrl'
    | 'password'
    | 'verified'
    | 'verificationToken'
    | 'resetToken'
  >
>;
