import { AuthUser } from './auth-user.interface';

export interface JwtPayload extends AuthUser {
  iat: number;
  exp: number;
}
