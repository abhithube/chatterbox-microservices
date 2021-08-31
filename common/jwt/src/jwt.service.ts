import jwt from 'jsonwebtoken';
import { Inject, Service } from 'typedi';
import { JWT_OPTIONS } from './constants';
import { AuthUser, JwtOptions, JwtPayload } from './interfaces';

@Service()
export class JwtService {
  constructor(@Inject(JWT_OPTIONS) private options: JwtOptions) {}

  sign(authUser: AuthUser, expiresIn?: string | number): string {
    return jwt.sign(authUser, this.options.secretOrKey, {
      expiresIn: expiresIn || this.options.expiresIn || '15m',
    });
  }

  verify(token: string): AuthUser {
    const { id, username, avatarUrl } = jwt.verify(
      token,
      this.options.secretOrKey
    ) as JwtPayload;

    return {
      id,
      username,
      avatarUrl,
    };
  }
}
