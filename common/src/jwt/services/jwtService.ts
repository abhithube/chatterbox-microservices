import jwt from 'jsonwebtoken';
import { AuthUser, JwtOptions, JwtPayload } from '../lib';

export interface JwtService {
  sign(authUser: AuthUser, expiresIn?: string | number): string;
  verify(token: string): AuthUser;
}

export function createJwtService(jwtOptions: JwtOptions): JwtService {
  function sign(authUser: AuthUser, expiresIn?: string | number): string {
    return jwt.sign(authUser, jwtOptions.secretOrKey, {
      expiresIn: expiresIn || jwtOptions.expiresIn || '15m',
    });
  }

  function verify(token: string): AuthUser {
    const { id, username, avatarUrl } = jwt.verify(
      token,
      jwtOptions.secretOrKey
    ) as JwtPayload;

    return {
      id,
      username,
      avatarUrl,
    };
  }

  return {
    sign,
    verify,
  };
}
