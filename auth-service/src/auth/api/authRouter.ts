import {
  jwtAuthMiddleware,
  JwtService,
  RequestWithUser,
  validationMiddleware,
  ValidationProperties,
} from '@chttrbx/common';
import { Router } from 'express';
import { HttpClient } from '../../shared';
import { LoginSchema } from '../lib';
import { AuthService } from '../services';
import {
  githubAuthMiddleware,
  googleAuthMiddleware,
  localAuthMiddleware,
} from './middlewares';

interface AuthRouterDeps {
  authService: AuthService;
  jwtService: JwtService;
  httpClient: HttpClient;
}

export function createAuthRouter({
  authService,
  jwtService,
  httpClient,
}: AuthRouterDeps): Router {
  const router = Router();

  router.post(
    '/login',
    validationMiddleware(ValidationProperties.BODY, LoginSchema),
    localAuthMiddleware({ authService }),
    async (req, res) => {
      const { user } = req as RequestWithUser;

      const { accessToken, refreshToken } = await authService.authenticateUser(
        user
      );

      res
        .cookie('refresh', refreshToken, {
          httpOnly: true,
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : true,
          secure: process.env.NODE_ENV === 'production',
        })
        .json({
          user,
          accessToken,
        });
    }
  );

  router.get('/google', (_req, res) => {
    const url =
      'https://accounts.google.com/o/oauth2/v2/auth' +
      `?client_id=${process.env.GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${process.env.SERVER_URL}/auth/google/callback` +
      '&response_type=code' +
      '&scope=email profile';

    res.redirect(url);
  });

  router.get(
    '/google/callback',
    googleAuthMiddleware({ authService, httpClient }),
    async (req, res) => {
      const { user } = req as RequestWithUser;

      const { refreshToken } = await authService.authenticateUser(user);

      res
        .cookie('refresh', refreshToken, {
          httpOnly: true,
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : true,
          secure: process.env.NODE_ENV === 'production',
        })
        .redirect(process.env.CLIENT_URL!);
    }
  );

  router.get('/github', (_req, res) => {
    const url =
      'https://github.com/login/oauth/authorize' +
      `?client_id=${process.env.GITHUB_CLIENT_ID}` +
      `&redirect_uri=${process.env.SERVER_URL}/auth/github/callback` +
      '&scope=user:email';

    res.redirect(url);
  });

  router.get(
    '/github/callback',
    githubAuthMiddleware({ authService, httpClient }),
    async (req, res) => {
      const { user } = req as RequestWithUser;

      const { refreshToken } = await authService.authenticateUser(user);

      res.json({
        refreshToken,
      });
    }
  );

  router.get('/@me', jwtAuthMiddleware({ jwtService }), (req, res) => {
    const { user } = req as RequestWithUser;
    res.json(user);
  });

  router.post('/refresh', async (req, res) => {
    const { refresh } = req.cookies;

    const { accessToken } = await authService.refreshAccessToken(refresh);

    res.json({
      accessToken,
    });
  });

  router.post('/logout', jwtAuthMiddleware({ jwtService }), (_req, res) => {
    res.clearCookie('refresh').json();
  });

  return router;
}
