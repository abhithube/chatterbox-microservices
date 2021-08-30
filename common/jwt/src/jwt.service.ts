import jwt from 'jsonwebtoken';
import { Container, Service } from 'typedi';
import { JWT_OPTIONS } from './constants';
import { AuthUser, JwtOptions, JwtPayload } from './interfaces';

@Service()
export class JwtService {
  private options: JwtOptions;

  constructor() {
    if (!Container.has(JWT_OPTIONS)) {
      throw new Error('JWT options not configured');
    }

    this.options = Container.get<JwtOptions>(JWT_OPTIONS);
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
