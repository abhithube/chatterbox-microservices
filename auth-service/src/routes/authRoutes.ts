import express from 'express';
import {
  getAuthenticatedUser,
  login,
  loginWithSocial,
  refreshAccessToken,
  register,
} from '../controllers/authController';
import asyncHandler from '../middleware/asyncHandler';
import cookieHandler from '../middleware/cookieHandler';

const router = express.Router();

router.post(
  '/auth/register',
  asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    const user = await register({ username, email, password });
    res.status(201).json(user);
  })
);

router.post(
  '/auth/login',
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    const { accessToken, refreshToken } = await login({ username, password });

    res.cookie('refresh', refreshToken, { httpOnly: true });
    res.status(200).json({ accessToken });
  })
);

router.get('/auth/google', (_, res) => {
  res.redirect(
    'https://accounts.google.com/o/oauth2/v2/auth' +
      `?client_id=${process.env.GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${process.env.GOOGLE_REDIRECT_URL}` +
      '&response_type=code' +
      '&scope=email'
  );
});

router.get('/auth/github', (_, res) => {
  res.redirect(
    'https://github.com/login/oauth/authorize' +
      `?client_id=${process.env.GITHUB_CLIENT_ID}` +
      `&redirect_uri=${process.env.GITHUB_REDIRECT_URL}` +
      '&scope=user:email'
  );
});

router.get(
  '/auth/google/callback',
  asyncHandler(async (req, res) => {
    const tokenUrl =
      'https://oauth2.googleapis.com/token' +
      `?client_id=${process.env.GOOGLE_CLIENT_ID}` +
      `&client_secret=${process.env.GOOGLE_CLIENT_SECRET}` +
      `&code=${req.query.code}` +
      '&grant_type=authorization_code' +
      `&redirect_uri=${process.env.GOOGLE_REDIRECT_URL}`;

    const profileUrl = 'https://www.googleapis.com/userinfo/v2/me';

    const { accessToken, refreshToken } = await loginWithSocial(
      tokenUrl,
      profileUrl
    );

    res.cookie('refresh', refreshToken, { httpOnly: true });
    res.status(200).json({ accessToken });
  })
);

router.get(
  '/auth/github/callback',
  asyncHandler(async (req, res) => {
    const tokenUrl =
      'https://github.com/login/oauth/access_token' +
      `?client_id=${process.env.GITHUB_CLIENT_ID}` +
      `&client_secret=${process.env.GITHUB_CLIENT_SECRET}` +
      `&code=${req.query.code}` +
      `&redirect_uri=${process.env.GITHUB_REDIRECT_URL}`;

    const profileUrl = 'https://api.github.com/user';

    const { accessToken, refreshToken } = await loginWithSocial(
      tokenUrl,
      profileUrl
    );

    res.cookie('refresh', refreshToken, { httpOnly: true });
    res.status(200).json({ accessToken });
  })
);

router.get(
  '/auth',
  asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const user = await getAuthenticatedUser(authHeader.split(' ')[1]);
    res.status(200).json(user);
  })
);

router.get(
  '/auth/refresh',
  cookieHandler,
  asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refresh;
    if (!refreshToken) {
      res.status(403).json({ message: 'User not authorized' });
      return;
    }

    const accessToken = await refreshAccessToken(refreshToken);
    res.status(200).json({ accessToken });
  })
);

export default router;
