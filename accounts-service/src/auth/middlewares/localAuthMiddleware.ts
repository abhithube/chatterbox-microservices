import { RequestWithUser } from '@chttrbx/common';
import { RequestHandler } from 'express';
import { AuthService } from '../authService';

interface LocalAuthMiddlewareDeps {
  authService: AuthService;
}

export const localAuthMiddleware =
  ({ authService }: LocalAuthMiddlewareDeps): RequestHandler =>
  async (req, _res, next) => {
    const { username, password } = req.body;
    const user = await authService.validateLocal(username, password);

    (req as RequestWithUser).user = user;
    next();
  };
