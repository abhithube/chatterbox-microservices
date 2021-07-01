import { User } from '@prisma/client';
import axios from 'axios';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { JwtPayload } from 'jsonwebtoken';
import prisma from '../config/prisma';
import { AuthenticatedUser } from '../types';
import emailUtil from '../util/emailUtil';
import HttpError from '../util/HttpError';
import tokenUtil from '../util/tokenUtil';

export type LoginInput = {
  username: string;
  password: string;
};

export type LoginResponse = {
  user: AuthenticatedUser;
  accessToken: string;
  refreshToken: string;
};

export const login = async ({
  username,
  password,
}: LoginInput): Promise<LoginResponse> => {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw new HttpError(400, 'Invalid credentials');

  if (!user.verified) throw new HttpError(400, 'Email not verified');
  if (!user.password || !bcrypt.compareSync(password, user.password))
    throw new HttpError(400, 'Invalid credentials');

  const authUser: AuthenticatedUser = {
    id: user.sub,
    username: user.username,
    avatarUrl: user.avatarUrl,
  };

  const accessToken = tokenUtil.generateAccessToken(authUser);
  const refreshToken = tokenUtil.generateRefreshToken();

  await prisma.token.create({
    data: {
      refreshId: refreshToken,
      userId: authUser.id,
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });

  return { user: authUser, accessToken, refreshToken };
};

export const loginWithGoogle = async (code: string): Promise<LoginResponse> => {
  const { data: tokenResponse } = await axios.post(
    'https://oauth2.googleapis.com/token' +
      `?client_id=${process.env.GOOGLE_CLIENT_ID}` +
      `&client_secret=${process.env.GOOGLE_CLIENT_SECRET}` +
      `&code=${code}` +
      '&grant_type=authorization_code' +
      `&redirect_uri=${process.env.GOOGLE_REDIRECT_URL}`
  );

  const { data: profile } = await axios.get(
    'https://www.googleapis.com/userinfo/v2/me',
    {
      headers: { authorization: `Bearer ${tokenResponse.access_token}` },
    }
  );

  let user = await prisma.user.findUnique({
    where: {
      email: profile.email,
    },
    select: { sub: true, username: true, avatarUrl: true },
  });

  if (!user) {
    const { data } = await axios.post(
      `${process.env.PROFILES_SERVICE_URL}/api/users`,
      {
        username: profile.name,
        email: profile.email,
        avatarUrl: profile.picture,
      }
    );
    user = { sub: data.id, username: data.username, avatarUrl: data.avatarUrl };
  }

  const authUser: AuthenticatedUser = {
    id: user.sub,
    username: user.username,
    avatarUrl: user.avatarUrl,
  };

  const accessToken = tokenUtil.generateAccessToken(authUser);
  const refreshToken = tokenUtil.generateRefreshToken();

  await prisma.token.create({
    data: {
      refreshId: refreshToken,
      userId: authUser.id,
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });

  return { user: authUser, accessToken, refreshToken };
};

export const loginWithGithub = async (code: string): Promise<LoginResponse> => {
  const { data: tokenResponse } = await axios.post(
    'https://github.com/login/oauth/access_token' +
      `?client_id=${process.env.GITHUB_CLIENT_ID}` +
      `&client_secret=${process.env.GITHUB_CLIENT_SECRET}` +
      `&code=${code}` +
      `&redirect_uri=${process.env.GITHUB_REDIRECT_URL}`,
    {},
    { headers: { accept: 'application/json' } }
  );

  const { data: profile } = await axios.get('https://api.github.com/user', {
    headers: { authorization: `Bearer ${tokenResponse.access_token}` },
  });

  let user = await prisma.user.findUnique({
    where: {
      email: profile.email,
    },
    select: { sub: true, username: true, avatarUrl: true },
  });

  if (!user) {
    const { data } = await axios.post(
      `${process.env.PROFILES_SERVICE_URL}/api/users`,
      {
        username: profile.name,
        email: profile.email,
        avatarUrl: profile.avatar_url,
      }
    );
    user = { sub: data.id, username: data.username, avatarUrl: data.avatarUrl };
  }

  const authUser: AuthenticatedUser = {
    id: user.sub,
    username: user.username,
    avatarUrl: user.avatarUrl,
  };

  const accessToken = tokenUtil.generateAccessToken(authUser);
  const refreshToken = tokenUtil.generateRefreshToken();

  await prisma.token.create({
    data: {
      refreshId: refreshToken,
      userId: authUser.id,
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });

  return { user: authUser, accessToken, refreshToken };
};

export const getAuthenticatedUser = async (
  payload: JwtPayload
): Promise<AuthenticatedUser> => {
  const { sub } = payload;
  if (!sub) throw new HttpError(500, 'Internal server error');

  const user = await prisma.user.findUnique({
    where: { sub },
    select: { id: true, username: true, avatarUrl: true },
  });
  if (!user) throw new HttpError(403, 'User not authorized');

  return user;
};

export const confirmEmail = async (
  verificationToken: string
): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { verificationToken } });
  if (!user) throw new HttpError(400, 'Invalid verification code');

  await prisma.user.update({
    where: { id: user.id },
    data: { verified: true, verificationToken: null },
  });
};

export const getPasswordResetLink = async (email: string): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new HttpError(404, 'User not found');

  if (!user.verified) throw new HttpError(400, 'Email not verified');

  const resetToken = crypto.randomBytes(16).toString('hex');

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken },
  });

  await emailUtil.sendResetEmail(user.email, resetToken);
};

export const resetPassword = async (
  resetToken: string,
  password: string
): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { resetToken } });
  if (!user) throw new HttpError(400, 'Invalid reset token');

  await prisma.user.update({
    where: { id: user.id },
    data: { password: bcrypt.hashSync(password, 10), resetToken: null },
  });
};

export const refreshAccessToken = async (
  refreshToken: string
): Promise<string> => {
  const token = await prisma.token.findUnique({
    where: { refreshId: refreshToken },
  });
  if (!token) throw new HttpError(403, 'User not authorized');

  if (new Date() > token.expiryDate) {
    await prisma.token.delete({ where: { id: token.id } });
    throw new HttpError(403, 'User not authorized');
  }

  try {
    tokenUtil.verifyToken(token.refreshId);
    return tokenUtil.generateAccessToken({ id: token.userId } as User);
  } catch (err) {
    throw new HttpError(403, 'User not authorized');
  }
};

export const logout = async (refreshToken: string): Promise<void> => {
  const token = await prisma.token.findUnique({
    where: { refreshId: refreshToken },
  });
  if (!token) throw new HttpError(403, 'User not authorized');

  await prisma.token.delete({ where: { refreshId: refreshToken } });
};
