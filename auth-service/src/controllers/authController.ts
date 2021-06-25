import { User } from '@prisma/client';
import axios from 'axios';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import HttpError from '../util/HttpError';

export type RegisterInput = {
  username: string;
  email: string;
  password: string;
};

export type LoginInput = {
  username: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

export const register = async ({
  username,
  email,
  password,
}: RegisterInput): Promise<User> => {
  let existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) throw new HttpError(400, 'Username already taken');

  existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new HttpError(400, 'Email already taken');

  const hashed = bcrypt.hashSync(password, 10);

  const user = await prisma.user.create({
    data: { username, email, password: hashed },
  });

  return user;
};

export const login = async ({
  username,
  password,
}: LoginInput): Promise<{
  accessToken: string;
  refreshToken: string;
}> => {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.password || !bcrypt.compareSync(password, user.password))
    throw new HttpError(400, 'Invalid credentials');

  const accessToken = jwt.sign(
    {},
    process.env.ACCESS_TOKEN_SECRET || 'JWT_ACCESS',
    {
      expiresIn: '15 min',
      subject: user.id,
    }
  );

  const refreshToken = jwt.sign(
    {},
    process.env.REFRESH_TOKEN_SECRET || 'JWT_REFRESH'
  );
  const token = await prisma.token.create({
    data: {
      refreshId: refreshToken,
      userId: user.id,
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });

  return { accessToken, refreshToken: token.refreshId };
};

export const loginWithSocial = async (
  tokenUrl: string,
  profileUrl: string
): Promise<LoginResponse> => {
  const { data: tokenResponse } = await axios.post(
    tokenUrl,
    {},
    { headers: { accept: 'application/json' } }
  );

  const { data: profile } = await axios.get(profileUrl, {
    headers: { authorization: `Bearer ${tokenResponse.access_token}` },
  });

  let user = await prisma.user.findUnique({
    where: {
      email: profile.email,
    },
  });

  if (!user)
    user = await prisma.user.create({ data: { email: profile.email } });

  const accessToken = jwt.sign(
    {},
    process.env.ACCESS_TOKEN_SECRET || 'JWT_ACCESS',
    {
      expiresIn: '15 min',
      subject: user.id,
    }
  );

  const refreshToken = jwt.sign(
    {},
    process.env.REFRESH_TOKEN_SECRET || 'JWT_REFRESH'
  );
  const token = await prisma.token.create({
    data: {
      refreshId: refreshToken,
      userId: user.id,
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });

  return { accessToken, refreshToken: token.refreshId };
};

export const getAuthenticatedUser = async (
  accessToken: string
): Promise<User> => {
  try {
    const payload = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET || 'JWT_ACCESS'
    ) as jwt.JwtPayload;

    const id = payload.sub;
    if (!id) throw new HttpError(403, 'User not authorized');

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new HttpError(403, 'User not authorized');

    return user;
  } catch (err) {
    throw new HttpError(403, 'User not authorized');
  }
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
    jwt.verify(
      token.refreshId,
      process.env.REFRESH_TOKEN_SECRET || 'JWT_REFRESH'
    ) as jwt.JwtPayload;

    const accessToken = jwt.sign(
      {},
      process.env.ACCESS_TOKEN_SECRET || 'JWT_ACCESS',
      {
        expiresIn: '15 sec',
        subject: token.userId,
      }
    );

    return accessToken;
  } catch (err) {
    throw new HttpError(403, 'User not authorized');
  }
};
