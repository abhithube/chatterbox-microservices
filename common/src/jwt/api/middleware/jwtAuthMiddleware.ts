import { RequestHandler } from 'express';
import { ForbiddenException } from '../../../shared';
import { RequestWithUser } from '../../lib';
import { JwtService } from '../../services';

interface JwtAuthMiddlewareDeps {
  jwtService: JwtService;
}

export function jwtAuthMiddleware({
  jwtService,
}: JwtAuthMiddlewareDeps): RequestHandler {
  return (req, _res, next) => {
    const header = req.headers.authorization;
    if (!header) {
      throw new ForbiddenException('User not authorized');
    }

    try {
      const token = header.split(' ')[1];
      const user = jwtService.verify(token);

      (req as RequestWithUser).user = user;
      next();
    } catch (err) {
      throw new ForbiddenException('User not authorized');
    }
  };
}
