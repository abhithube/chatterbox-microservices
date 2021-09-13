import { RequestHandler } from 'express';
import { RequestWithUser, UnauthorizedException } from '../../api';
import { TokenIssuer } from '../TokenIssuer';

interface JwtAuthMiddlewareDeps {
  tokenIssuer: TokenIssuer;
}

export function jwtAuthMiddleware({
  tokenIssuer,
}: JwtAuthMiddlewareDeps): RequestHandler {
  return (req, _res, next) => {
    const header = req.headers.authorization;
    if (!header) {
      throw new UnauthorizedException('User not authorized');
    }

    try {
      const token = header.split(' ')[1];
      const user = tokenIssuer.validate(token);

      (req as RequestWithUser).user = user;
      next();
    } catch (err) {
      throw new UnauthorizedException('User not authorized');
    }
  };
}
