import { CurrentUser } from '@chttrbx/common';

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
