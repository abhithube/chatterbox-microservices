/* eslint-disable camelcase */
import { RequestWithUser } from '@chttrbx/common';
import { RequestHandler } from 'express';
import { HttpClient } from '../../common';
import { AuthService } from '../authService';

interface GithubAuthMiddlewareDeps {
  authService: AuthService;
  httpClient: HttpClient;
}

interface GitHubProfile {
  login: string;
  avatar_url: string;
  email: string;
}

export function githubAuthMiddleware({
  authService,
  httpClient,
}: GithubAuthMiddlewareDeps): RequestHandler {
  return async (req, _res, next) => {
    const url =
      'https://github.com/login/oauth/access_token' +
      `?client_id=${process.env.GITHUB_CLIENT_ID}` +
      `&client_secret=${process.env.GITHUB_CLIENT_SECRET}` +
      `&code=${req.query.code}`;

    const data = await httpClient.post<void, string>(url);

    const accessToken = data.split('&')[0].split('=')[1];

    const profile = await httpClient.get<GitHubProfile>(
      'https://api.github.com/user',
      {
        authorization: `Bearer ${accessToken}`,
      }
    );

    const user = await authService.validateOAuth(
      profile.login,
      profile.email,
      profile.avatar_url
    );

    (req as RequestWithUser).user = user;
    next();
  };
}
