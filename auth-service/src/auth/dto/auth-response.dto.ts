import { AuthUser } from '@chttrbx/jwt';

export class AuthResponseDto {
  user: AuthUser;
  accessToken: string;
}
