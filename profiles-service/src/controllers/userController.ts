import { User } from '@prisma/client';
import prisma from '../config/prisma';
import producer from '../config/producer';
import HttpError from '../util/HttpError';

export type CreateUserInput = {
  username: string;
  email: string;
  password: string;
};

export const getUser = async (id: string): Promise<User> => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new HttpError(404, 'User not found');

  return user;
};

export const createUser = async (
  createUserInput: CreateUserInput
): Promise<User> => {
  const { username, email, password } = createUserInput;

  let exists = await prisma.user.findUnique({ where: { username } });
  if (exists) throw new HttpError(400, 'Username already taken');

  exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new HttpError(400, 'Email already taken');

  const user = await prisma.user.create({
    data: { username, email },
  });

  await producer.connect();
  await producer.send({
    topic: 'users',
    messages: [
      {
        value: JSON.stringify({
          type: 'USER_CREATED',
          data: { ...user, password },
        }),
      },
    ],
  });
  await producer.disconnect();

  return user;
};

export const deleteUser = async (id: string): Promise<User> => {
  const exists = await prisma.user.findUnique({ where: { id } });
  if (!exists) throw new HttpError(404, 'User not found');

  const user = await prisma.user.delete({ where: { id } });

  await producer.connect();
  await producer.send({
    topic: 'users',
    messages: [{ value: JSON.stringify({ type: 'USER_DELETED', data: user }) }],
  });
  await producer.disconnect();

  return user;
};
