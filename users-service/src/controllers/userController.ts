import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import kafka, { USERS_TOPIC } from '../config/kafka';
import prisma from '../config/prisma';
import { HttpError } from '../util/HttpError';

export type CreateUserInput = {
  username: string;
  email: string;
  password: string;
};

export const getUserByUsername = async (username: string): Promise<User> => {
  const user = await prisma.user.findUnique({ where: { username } });
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

  const hashed = bcrypt.hashSync(password, 10);

  const user = await prisma.user.create({
    data: { username, email, password: hashed },
  });

  await kafka.producer.connect();
  await kafka.producer.send({
    topic: USERS_TOPIC,
    messages: [{ value: JSON.stringify({ type: 'USER_CREATED', data: user }) }],
  });
  await kafka.producer.disconnect();

  return user;
};

export const deleteUserByUsername = async (username: string): Promise<User> => {
  const exists = await prisma.user.findUnique({ where: { username } });
  if (!exists) throw new HttpError(404, 'User not found');

  const user = await prisma.user.delete({ where: { username } });

  await kafka.producer.connect();
  await kafka.producer.send({
    topic: USERS_TOPIC,
    messages: [{ value: JSON.stringify({ type: 'USER_DELETED', data: user }) }],
  });
  await kafka.producer.disconnect();

  return user;
};
