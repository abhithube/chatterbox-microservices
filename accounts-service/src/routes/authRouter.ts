import {
  ConfigManager,
  HttpClient,
  jwtAuthMiddleware,
  RequestWithUser,
  TokenIssuer,
} from '@chttrbx/common';
import { Router } from 'express';
import { RequestWithCookies } from '../interfaces';
import {
  cookieMiddleware,
  githubAuthMiddleware,
  googleAuthMiddleware,
} from '../middleware';
import { AuthService } from '../services';

interface AuthRouterDeps {
  authService: AuthService;
  tokenIssuer: TokenIssuer;
  httpClient: HttpClient;
  configManager: ConfigManager;
}

export function createAuthRouter({
  authService,
  tokenIssuer,
  httpClient,
  configManager,
}: AuthRouterDeps): Router {
  const router = Router();

  const isProduction = configManager.get('NODE_ENV') === 'production';

  router.get('/google', (_req, res) => {
    const url =
      'https://accounts.google.com/o/oauth2/v2/auth' +
      `?client_id=${configManager.get('GOOGLE_CLIENT_ID')}` +
      `&redirect_uri=${configManager.get('SERVER_URL')}/auth/google/callback` +
      '&response_type=code' +
      '&scope=email profile';

    res.redirect(url);
  });

  router.get(
    '/google/callback',
    googleAuthMiddleware({
      authService,
      httpClient,
      configManager,
    }),
    async (req, res) => {
      const { user } = req as RequestWithUser;

      const { refreshToken } = await authService.authenticateUser(user);

      res
        .cookie('refresh', refreshToken, {
          httpOnly: true,
          sameSite: isProduction ? 'none' : true,
          secure: isProduction,
        })
        .redirect(configManager.get('CLIENT_URL')!);
    }
  );

  router.get('/github', (_req, res) => {
    const url =
      'https://github.com/login/oauth/authorize' +
      `?client_id=${configManager.get('GITHUB_CLIENT_ID')}` +
      `&redirect_uri=${configManager.get('SERVER_URL')}/auth/github/callback` +
      '&scope=user:email';

    res.redirect(url);
  });

  router.get(
    '/github/callback',
    githubAuthMiddleware({
      authService,
      httpClient,
      configManager,
    }),
    async (req, res) => {
      const { user } = req as RequestWithUser;

      const { refreshToken } = await authService.authenticateUser(user);

      res
        .cookie('refresh', refreshToken, {
          httpOnly: true,
          sameSite: isProduction ? 'none' : true,
          secure: isProduction,
        })
        .redirect(configManager.get('CLIENT_URL')!);
    }
  );

  router.get('/@me', jwtAuthMiddleware({ tokenIssuer }), (req, res) => {
    const { user } = req as RequestWithUser;
    res.json(user);
  });

  router.post('/refresh', cookieMiddleware, async (req, res) => {
    const { cookies } = req as RequestWithCookies;

    const { accessToken } = await authService.refreshAccessToken(
      cookies.refresh
    );

    res.json({
      accessToken,
    });
  });

  router.post('/logout', jwtAuthMiddleware({ tokenIssuer }), (_req, res) => {
    res.clearCookie('refresh').json();
  });

  return router;
}
