import { AuthUser } from './AuthUser';

export interface JwtPayload extends AuthUser {
  iat: number;
  exp: number;
}
