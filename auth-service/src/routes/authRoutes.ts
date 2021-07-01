import express from 'express';
import { JwtPayload } from 'jsonwebtoken';
import {
  confirmEmail,
  getAuthenticatedUser,
  getPasswordResetLink,
  login,
  loginWithGithub,
  loginWithGoogle,
  logout,
  refreshAccessToken,
  resetPassword,
} from '../controllers/authController';
import asyncHandler from '../middleware/asyncHandler';
import authHandler from '../middleware/authHandler';
import cookieHandler from '../middleware/cookieHandler';
import { RequestWithAuth } from '../types';
import HttpError from '../util/HttpError';

const router = express.Router();

router.post(
  '/auth/login',
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    const { user, accessToken, refreshToken } = await login({
      username,
      password,
    });

    res.cookie('refresh', refreshToken, { httpOnly: true });
    res.status(200).json({ user, accessToken });
  })
);

router.get('/auth/google', (_, res) => {
  res.redirect(
    'https://accounts.google.com/o/oauth2/v2/auth' +
      `?client_id=${process.env.GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${process.env.GOOGLE_REDIRECT_URL}` +
      '&response_type=code' +
      '&scope=email+profile'
  );
});

router.get(
  '/auth/google/callback',
  asyncHandler(async (req, res) => {
    const { code } = req.query;
    if (!code) throw new HttpError(400, 'Invalid authentication code');

    const { user, accessToken, refreshToken } = await loginWithGoogle(
      code as string
    );

    res.cookie('refresh', refreshToken, { httpOnly: true });
    res.status(200).json({ user, accessToken });
  })
);

router.get('/auth/github', (_, res) => {
  res.redirect(
    'https://github.com/login/oauth/authorize' +
      `?client_id=${process.env.GITHUB_CLIENT_ID}` +
      `&redirect_uri=${process.env.GITHUB_REDIRECT_URL}` +
      '&scope=user:email'
  );
});

router.get(
  '/auth/github/callback',
  asyncHandler(async (req, res) => {
    const { code } = req.query;
    if (!code) throw new HttpError(400, 'Invalid authentication code');

    const { user, accessToken, refreshToken } = await loginWithGithub(
      code as string
    );

    res.cookie('refresh', refreshToken, { httpOnly: true });
    res.status(200).json({ user, accessToken });
  })
);

router.get(
  '/auth',
  authHandler,
  asyncHandler(async (req: RequestWithAuth, res) => {
    const { payload } = req;

    const user = await getAuthenticatedUser(payload as JwtPayload);
    res.status(200).json(user);
  })
);

router.get(
  '/auth/confirm-email',
  asyncHandler(async (req, res) => {
    const { token } = req.query;
    if (!token) throw new HttpError(400, 'Invalid verification token');

    await confirmEmail(token as string);
    res.status(200).json({ message: 'Email verified successfully' });
  })
);

router.post(
  '/auth/forgot-password',
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    await getPasswordResetLink(email);
    res.status(200).json({ message: 'Password reset link sent' });
  })
);

router.post(
  '/auth/reset-password',
  asyncHandler(async (req, res) => {
    const { token } = req.query;
    const { password } = req.body;
    if (!token) throw new HttpError(400, 'Invalid reset token');

    await resetPassword(token as string, password);
    res.status(200).json({ message: 'Password reset successfully' });
  })
);

router.post(
  '/auth/refresh-token',
  cookieHandler,
  asyncHandler(async (req, res) => {
    const { refresh } = req.cookies;
    if (!refresh) {
      res.status(403).json({ message: 'User not authorized' });
      return;
    }

    const accessToken = await refreshAccessToken(refresh);
    res.status(200).json({ accessToken });
  })
);

router.post(
  '/auth/logout',
  cookieHandler,
  asyncHandler(async (req, res) => {
    const { refresh } = req.cookies;
    if (!refresh) {
      res.status(403).json({ message: 'User not authorized' });
      return;
    }

    await logout(refresh);

    res.cookie('refresh', '', { httpOnly: true });
    res.status(200).json({ message: 'Logged out successfully' });
  })
);

export default router;
