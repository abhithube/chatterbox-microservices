import { Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { AuthUser, JwtOptions, JwtPayload } from './interfaces';

@Injectable()
export class JwtService {
  private secret: string;
  constructor(@Inject('JWT_OPTIONS') { secretOrKey }: JwtOptions) {
    this.secret = secretOrKey;
  }

  sign(authUser: AuthUser, expiresIn: string | number): string {
    return jwt.sign(authUser, this.secret, {
      expiresIn,
    });
  }

  verify(token: string): AuthUser {
    const { id, username, avatarUrl } = jwt.verify(
      token,
      this.secret,
    ) as JwtPayload;

    return {
      id,
      username,
      avatarUrl,
    };
  }
}
