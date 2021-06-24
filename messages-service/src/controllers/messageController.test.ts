import { Message, PrismaClient, Topic, User } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { Producer } from 'kafkajs';
import { mocked } from 'ts-jest/utils';
import prisma from '../config/prisma';
import {
  createMessage,
  CreateMessageInput,
  getAllTopicMessages,
} from './messageController';

jest.mock('../config/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

jest.mock('../config/producer', () => ({
  __esModule: true,
  default: mockDeep<Producer>(),
}));

const prismaMock = mocked(prisma, true);

const messages: Message[] = [
  {
    id: 1,
    body: 'test1',
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 1,
    topicId: 1,
  },
  {
    id: 2,
    body: 'test2',
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 1,
    topicId: 1,
  },
];

const user: User = {
  id: 1,
  publicId: '123',
  username: 'test user',
};

const topic: Topic = {
  id: 1,
  name: 'test topic',
  createdAt: new Date(),
  updatedAt: new Date(),
  partyId: 1,
};

describe('getAllTopicMessages()', () => {
  test('should get all messages by topic', async () => {
    prismaMock.message.findMany.mockResolvedValue(messages);

    const res = await getAllTopicMessages(1);

    expect(res).toBe(messages);
  });
});

describe('createMessage()', () => {
  test('should create new message', async () => {
    const createMessageInput: CreateMessageInput = {
      body: 'test message',
      userId: '123',
      topicId: 1,
    };

    prismaMock.user.findUnique.mockResolvedValue(user);
    prismaMock.topic.findUnique.mockResolvedValue(topic);
    prismaMock.message.create.mockResolvedValue(messages[0]);

    const res = await createMessage(createMessageInput);

    expect(res).toBe(messages[0]);
  });

  test('should throw error if user does not exist', async () => {
    const createMessageInput: CreateMessageInput = {
      body: 'test message',
      userId: '123',
      topicId: 1,
    };

    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(createMessage(createMessageInput)).rejects.toThrow(
      'User not found'
    );
  });

  test('should throw error if topic does not exist', async () => {
    const createMessageInput: CreateMessageInput = {
      body: 'test message',
      userId: '123',
      topicId: 1,
    };

    prismaMock.user.findUnique.mockResolvedValue(user);
    prismaMock.topic.findUnique.mockResolvedValue(null);

    await expect(createMessage(createMessageInput)).rejects.toThrow(
      'Topic not found'
    );
  });
});
