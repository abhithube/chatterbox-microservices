import jwt from 'jsonwebtoken';
import { AuthUser, JwtOptions, JwtPayload } from './interfaces';

export class JwtService {
  private options: JwtOptions;

  constructor(options: JwtOptions) {
    this.options = options;
  }

  sign(authUser: AuthUser, expiresIn?: string | number): string {
    return jwt.sign(authUser, this.options.secretOrKey, {
      expiresIn: expiresIn || this.options.expiresIn || '1h',
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
