import { Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { AuthUser, JwtOptions, JwtPayload } from './interfaces';

@Injectable()
export class JwtService {
  private secret: string;
  constructor(@Inject('JWT_OPTIONS') { secretOrKey }: JwtOptions) {
    this.secret = secretOrKey;
  }

  verify(token: string): AuthUser {
    const { sub, username, avatarUrl } = jwt.verify(
      token,
      this.secret,
    ) as JwtPayload;

    return {
      id: sub,
      username,
      avatarUrl,
    };
  }
}
