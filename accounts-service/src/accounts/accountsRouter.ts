import {
  jwtAuthMiddleware,
  RequestWithUser,
  TokenIssuer,
  validationMiddleware,
} from '@chttrbx/common';
import { Router } from 'express';
import { AccountsService } from './accountsService';
import {
  ConfirmEmailDto,
  ConfirmEmailSchema,
  ForgotPasswordDto,
  ForgotPasswordSchema,
  RegisterSchema,
  ResetPasswordDto,
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

    const account = await accountsService.getAccount(user.id);

    res.json(account);
  });

  router.post(
    '/confirm',
    validationMiddleware(ConfirmEmailSchema),
    async (req, res) => {
      const { token } = req.body as ConfirmEmailDto;

      await accountsService.confirmEmail(token);

      res.json();
    }
  );

  router.post(
    '/forgot',
    validationMiddleware(ForgotPasswordSchema),
    async (req, res) => {
      const { email } = req.body as ForgotPasswordDto;

      await accountsService.getPasswordResetLink(email);

      res.json();
    }
  );

  router.post(
    '/reset',
    validationMiddleware(ResetPasswordSchema),
    async (req, res) => {
      const { token, password } = req.body as ResetPasswordDto;

      await accountsService.resetPassword(token, password);

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
