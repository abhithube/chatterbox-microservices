import { Message } from '@prisma/client';
import prisma from '../config/prisma';
import HttpError from '../util/HttpError';

export type CreateMessageInput = {
  body: string;
  userId: string;
  topicId: number;
};

export const getAllTopicMessages = (topicId: number): Promise<Message[]> =>
  prisma.message.findMany({ where: { topicId } });

export const createMessage = async ({
  body,
  userId,
  topicId,
}: CreateMessageInput): Promise<Message> => {
  const userExists = await prisma.user.findUnique({
    where: { publicId: userId },
  });
  if (!userExists) throw new HttpError(404, 'User not found');

  const topicExists = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topicExists) throw new HttpError(404, 'Topic not found');

  const message = await prisma.message.create({
    data: { body, userId: userExists.id, topicId: topicExists.id },
  });

  return message;
};

export const deleteMessage = async (id: number): Promise<Message> => {
  const exists = await prisma.message.findUnique({ where: { id } });
  if (!exists) throw new HttpError(404, 'Message not found');

  const message = await prisma.message.delete({ where: { id } });

  return message;
};
