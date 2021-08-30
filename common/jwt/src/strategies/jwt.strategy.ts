import { ExtractJwt, Strategy } from 'passport-jwt';
import { Container, Service } from 'typedi';
import { JWT_OPTIONS } from '../constants';
import { JwtOptions, JwtPayload } from '../interfaces';

@Service()
export class JwtStrategy extends Strategy {
  constructor() {
    if (!Container.has(JWT_OPTIONS)) {
      throw new Error('JWT options not configured');
    }

    const options = Container.get<JwtOptions>(JWT_OPTIONS);

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
