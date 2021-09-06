import {
  jwtAuthMiddleware,
  JwtService,
  RequestWithUser,
  validationMiddleware,
  ValidationProperties,
} from '@chttrbx/common';
import { Router } from 'express';
import { AccountsService } from './accountsService';
import {
  ConfirmEmailDto,
  ForgotPasswordDto,
  RegisterSchema,
  ResetPasswordDto,
} from './interfaces';

interface AccountsRouterDeps {
  accountsService: AccountsService;
  jwtService: JwtService;
}

export function createAccountsRouter({
  accountsService,
  jwtService,
}: AccountsRouterDeps): Router {
  const router = Router();

  router.post(
    '/register',
    validationMiddleware(ValidationProperties.BODY, RegisterSchema),
    async (req, res) => {
      const user = await accountsService.registerUser(req.body);

      res.status(201).json(user);
    }
  );

  router.post('/confirm', async (req, res) => {
    const { token } = req.body as ConfirmEmailDto;

    await accountsService.confirmEmail(token);

    res.json();
  });

  router.post('/forgot', async (req, res) => {
    const { email } = req.body as ForgotPasswordDto;

    await accountsService.getPasswordResetLink(email);

    res.json();
  });

  router.post('/reset', async (req, res) => {
    const { token, password } = req.body as ResetPasswordDto;

    await accountsService.resetPassword(token, password);

    res.json();
  });

  router.delete('/@me', jwtAuthMiddleware({ jwtService }), async (req, res) => {
    const { user } = req as RequestWithUser;

    await accountsService.deleteUser(user.id);

    res.clearCookie('refresh').json();
  });

  return router;
}
