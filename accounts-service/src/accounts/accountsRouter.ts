import {
  jwtAuthMiddleware,
  RequestWithUser,
  TokenIssuer,
} from '@chttrbx/common';
import { Router } from 'express';
import { AccountsService } from './accountsService';

interface AccountsRouterDeps {
  accountsService: AccountsService;
  tokenIssuer: TokenIssuer;
}

export function createAccountsRouter({
  accountsService,
  tokenIssuer,
}: AccountsRouterDeps): Router {
  const router = Router();

  router.get('/', (_, res) => res.status(200).json({ status: 'UP' }));

  router.get('/@me', jwtAuthMiddleware({ tokenIssuer }), async (req, res) => {
    const { user } = req as RequestWithUser;

    const account = await accountsService.getAccount(user);

    res.json(account);
  });

  router.delete(
    '/@me',
    jwtAuthMiddleware({ tokenIssuer }),
    async (req, res) => {
      const { user } = req as RequestWithUser;

      await accountsService.deleteAccount(user.id);

      res.clearCookie('refresh').json();
    }
  );

  return router;
}
