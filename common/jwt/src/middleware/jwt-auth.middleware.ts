import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import { ExpressMiddlewareInterface } from 'routing-controllers';
import { JwtStrategy } from '../strategies/jwt.strategy';

export class JwtAuthMiddleware implements ExpressMiddlewareInterface {
  // eslint-disable-next-line class-methods-use-this
  use(req: Request, res: Response, next: NextFunction): void {
    passport.authenticate(JwtStrategy, {
      session: false,
    })(req, res, next);
  }
}
