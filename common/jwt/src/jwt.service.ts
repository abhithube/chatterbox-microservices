import { Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { AuthUser, JwtOptions, JwtPayload } from './interfaces';

@Injectable()
export class JwtService {
  private options: JwtOptions;

  constructor(@Inject('JWT_OPTIONS') options: JwtOptions) {
    this.options = options;
  }

  sign(authUser: AuthUser, expiresIn?: string | number): string {
    return jwt.sign(authUser, this.options.secretOrKey, {
      expiresIn: expiresIn || this.options.expiresIn,
    });
  }

  verify(token: string): AuthUser {
    const { id, username, avatarUrl } = jwt.verify(
      token,
      this.options.secretOrKey,
    ) as JwtPayload;

    return {
      id,
      username,
      avatarUrl,
    };
  }
}
