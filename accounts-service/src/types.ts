import { CurrentUser } from '@chttrbx/common';
import { User } from './models';

export type UserFilterOptions = Partial<
  Pick<User, 'id' | 'username' | 'email'>
>;

export type UserUpdateOptions = Partial<Pick<User, 'username' | 'avatarUrl'>>;

export type TokenResponseDto = {
  accessToken: string;
  refreshToken: string;
};

export type LoginResponseDto = Pick<TokenResponseDto, 'accessToken'> & {
  user: CurrentUser;
};

export type AuthResponseDto = Pick<TokenResponseDto, 'refreshToken'> &
  Partial<LoginResponseDto>;

export type RefreshResponseDto = Pick<TokenResponseDto, 'accessToken'>;
