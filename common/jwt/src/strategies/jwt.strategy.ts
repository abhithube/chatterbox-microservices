import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser, JwtOptions, JwtPayload } from '../interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(@Inject('AUTH_OPTIONS') { secretOrKey }: JwtOptions) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey,
    });
  }

  async validate(jwtPayload: JwtPayload): Promise<AuthUser> {
    return {
      id: jwtPayload.sub,
      username: jwtPayload.username,
      avatarUrl: jwtPayload.avatarUrl,
    };
  }
}
