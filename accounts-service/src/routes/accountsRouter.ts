import {
  jwtAuthMiddleware,
  RequestWithUser,
  TokenIssuer,
} from '@chttrbx/common';
import { Router } from 'express';
import { AccountsService } from '../services';

interface AccountsRouterDeps {
  accountsService: AccountsService;
  tokenIssuer: TokenIssuer;
}

export function createAccountsRouter({
  accountsService,
  tokenIssuer,
}: AccountsRouterDeps): Router {
  const router = Router();

  router.get('/@me', jwtAuthMiddleware({ tokenIssuer }), async (req, res) => {
    const { user } = req as RequestWithUser;

    const account = await accountsService.getAccount(user);

    res.json(account);
  });

  return router;
}
