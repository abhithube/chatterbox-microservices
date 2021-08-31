import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject, Service } from 'typedi';
import { JWT_OPTIONS } from '../constants';
import { JwtOptions, JwtPayload } from '../interfaces';

@Service()
export class JwtStrategy extends Strategy {
  constructor(@Inject(JWT_OPTIONS) private options: JwtOptions) {
    super(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: options.secretOrKey,
      },
      ({ id, username, avatarUrl }: JwtPayload, done) => {
        done(null, {
          id,
          username,
          avatarUrl,
        });
      }
    );
  }
}
