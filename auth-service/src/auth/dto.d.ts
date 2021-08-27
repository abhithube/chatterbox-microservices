import { AuthUser } from '@chttrbx/jwt';
import { User } from './user.entity';

export type UserDto = Pick<
  User,
  'id' | 'username' | 'email' | 'avatarUrl' | 'verified'
>;

export type AuthResponseDto = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

export type LoginResponseDto = Omit<AuthResponseDto, 'refreshToken'>;

export type RefreshResponseDto = Pick<AuthResponseDto, 'accessToken'>;
