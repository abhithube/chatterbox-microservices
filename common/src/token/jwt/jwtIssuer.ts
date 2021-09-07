import jwt from 'jsonwebtoken';
import { CurrentUser } from '../../shared';
import { TokenPayload } from '../interfaces';
import { TokenIssuer } from '../TokenIssuer';
import { JwtOptions } from './interfaces';

export function createJwtIssuer(jwtOptions: JwtOptions): TokenIssuer {
  function generate(user: CurrentUser, expiresIn?: string | number): string {
    return jwt.sign({}, jwtOptions.secretOrKey, {
      subject: user.id,
      expiresIn: expiresIn || jwtOptions.expiresIn || '15m',
    });
  }

  function validate(token: string): CurrentUser {
    const payload = jwt.verify(token, jwtOptions.secretOrKey) as TokenPayload;

    return {
      id: payload.sub,
    };
  }

  return {
    generate,
    validate,
  };
}
