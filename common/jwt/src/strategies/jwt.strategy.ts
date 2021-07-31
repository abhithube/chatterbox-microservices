import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser, JwtOptions, JwtPayload } from '../interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(@Inject('JWT_OPTIONS') { secretOrKey }: JwtOptions) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey,
    });
  }

  async validate({ sub, username, avatarUrl }: JwtPayload): Promise<AuthUser> {
    return {
      id: sub,
      username,
      avatarUrl,
    };
  }
}
