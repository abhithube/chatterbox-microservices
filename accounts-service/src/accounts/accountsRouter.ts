import {
  jwtAuthMiddleware,
  RequestWithUser,
  TokenIssuer,
  validationMiddleware,
} from '@chttrbx/common';
import { Router } from 'express';
import { AccountsService } from './accountsService';
import {
  ConfirmEmailSchema,
  ForgotPasswordSchema,
  RegisterSchema,
  ResetPasswordSchema,
} from './interfaces';

interface AccountsRouterDeps {
  accountsService: AccountsService;
  tokenIssuer: TokenIssuer;
}

export function createAccountsRouter({
  accountsService,
  tokenIssuer,
}: AccountsRouterDeps): Router {
  const router = Router();

  router.post('/', validationMiddleware(RegisterSchema), async (req, res) => {
    const user = await accountsService.createAccount(req.body);

    res.status(201).json(user);
  });

  router.get('/@me', jwtAuthMiddleware({ tokenIssuer }), async (req, res) => {
    const { user } = req as RequestWithUser;

    const account = await accountsService.getAccount(user);

    res.json(account);
  });

  router.post(
    '/confirm',
    validationMiddleware(ConfirmEmailSchema),
    async (req, res) => {
      const { body } = req;

      await accountsService.confirmEmail(body);

      res.json();
    }
  );

  router.post(
    '/forgot',
    validationMiddleware(ForgotPasswordSchema),
    async (req, res) => {
      const { body } = req;

      await accountsService.getPasswordResetLink(body);

      res.json();
    }
  );

  router.post(
    '/reset',
    validationMiddleware(ResetPasswordSchema),
    async (req, res) => {
      const { body } = req;

      await accountsService.resetPassword(body);

      res.json();
    }
  );

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
