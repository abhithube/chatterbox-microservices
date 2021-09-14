import { ConfigManager, HttpClient, RequestWithUser } from '@chttrbx/common';
import { RequestHandler } from 'express';
import { AuthService } from '../authService';

interface TokenResponse {
  // eslint-disable-next-line camelcase
  access_token: string;
}

interface GoogleProfile {
  name: string;
  email: string;
  picture: string;
}

interface GoogleAuthMiddlewareDeps {
  authService: AuthService;
  httpClient: HttpClient;
  configManager: ConfigManager;
}

export const googleAuthMiddleware =
  ({
    authService,
    httpClient,
    configManager,
  }: GoogleAuthMiddlewareDeps): RequestHandler =>
  async (req, _res, next) => {
    const url =
      'https://oauth2.googleapis.com/token' +
      `?client_id=${configManager.get('GOOGLE_CLIENT_ID')}` +
      `&client_secret=${configManager.get('GOOGLE_CLIENT_SECRET')}` +
      `&code=${req.query.code}` +
      '&grant_type=authorization_code' +
      `&redirect_uri=${configManager.get('SERVER_URL')}/auth/google/callback`;

    const data = await httpClient.post<void, TokenResponse>(url);

    const accessToken = data.access_token;

    const profile = await httpClient.get<GoogleProfile>(
      'https://www.googleapis.com/userinfo/v2/me',
      {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const user = await authService.validateOAuth(
      profile.name,
      profile.email,
      profile.picture
    );

    (req as RequestWithUser).user = user;
    next();
  };
