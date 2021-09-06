import { UserDocument } from '../../shared/models';

export type UserDto = Pick<
  UserDocument,
  | 'id'
  | 'username'
  | 'email'
  | 'avatarUrl'
  | 'verified'
  | 'verificationToken'
  | 'resetToken'
>;
