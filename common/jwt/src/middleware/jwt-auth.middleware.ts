import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import {
  ExpressMiddlewareInterface,
  ForbiddenError,
} from 'routing-controllers';
import { Inject, Service } from 'typedi';
import { AuthUser } from '../interfaces';
import { JwtStrategy } from '../strategies/jwt.strategy';

@Service()
export class JwtAuthMiddleware implements ExpressMiddlewareInterface {
  @Inject()
  private jwtStrategy!: JwtStrategy;

  use(req: Request, res: Response, next: NextFunction): void {
    passport.authenticate(
      this.jwtStrategy,
      {
        session: false,
      },
      (err, user: AuthUser) => {
        if (err || !user) throw new ForbiddenError('User not authorized');

        req.user = user;

        return next();
      }
    )(req, res, next);
  }
}
