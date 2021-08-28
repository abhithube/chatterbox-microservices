import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces';

export const JwtStrategy = new Strategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  },
  ({ id, username, avatarUrl }: JwtPayload, done) => {
    done(null, {
      id,
      username,
      avatarUrl,
    });
  },
);
