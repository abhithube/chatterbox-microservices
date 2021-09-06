/* eslint-disable camelcase */
import { RequestWithUser } from '@chttrbx/common';
import { RequestHandler } from 'express';
import { HttpClient } from '../../common';
import { AuthService } from '../authService';

interface TokenResponse {
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
}

export function googleAuthMiddleware({
  authService,
  httpClient,
}: GoogleAuthMiddlewareDeps): RequestHandler {
  return async (req, res, next) => {
    const url =
      'https://oauth2.googleapis.com/token' +
      `?client_id=${process.env.GOOGLE_CLIENT_ID}` +
      `&client_secret=${process.env.GOOGLE_CLIENT_SECRET}` +
      `&code=${req.query.code}` +
      '&grant_type=authorization_code' +
      `&redirect_uri=${process.env.SERVER_URL}/auth/google/callback`;

    const data = await httpClient.post<void, TokenResponse>(url);

    const accessToken = data.access_token;

    const profile = await httpClient.get<GoogleProfile>(
      'https://www.googleapis.com/userinfo/v2/me',
      {
        authorization: `Bearer ${accessToken}`,
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
}
