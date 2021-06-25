import { User } from '@prisma/client';
import axios from 'axios';
import bcrypt from 'bcrypt';
import prisma from '../config/prisma';
import producer from '../config/producer';
import HttpError from '../util/HttpError';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from '../util/token';

export type RegisterInput = {
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
  email,
  password,
}: RegisterInput): Promise<User> => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new HttpError(400, 'Email already taken');

  const hashed = bcrypt.hashSync(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hashed },
  });

  await producer.connect();
  await producer.send({
    topic: 'USERS',
    messages: [
      {
        value: JSON.stringify({
          type: 'USER_CREATED',
          data: { id: user.id, email: user.email },
        }),
      },
    ],
  });
  await producer.disconnect();

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

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken();

  await prisma.token.create({
    data: {
      refreshId: refreshToken,
      userId: user.id,
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });

  return { accessToken, refreshToken };
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

  if (!user) {
    user = await prisma.user.create({ data: { email: profile.email } });

    await producer.connect();
    await producer.send({
      topic: 'USERS',
      messages: [
        {
          value: JSON.stringify({
            type: 'USER_CREATED',
            data: { id: user.id, email: user.email },
          }),
        },
      ],
    });
    await producer.disconnect();
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken();

  await prisma.token.create({
    data: {
      refreshId: refreshToken,
      userId: user.id,
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });

  return { accessToken, refreshToken };
};

export const getAuthenticatedUser = async (
  accessToken: string
): Promise<User> => {
  try {
    const payload = verifyToken(accessToken);

    const id = payload.sub;
    if (!id) throw new HttpError(500, 'Internal server error');

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
    verifyToken(token.refreshId);
    return generateAccessToken(token.userId);
  } catch (err) {
    throw new HttpError(403, 'User not authorized');
  }
};
