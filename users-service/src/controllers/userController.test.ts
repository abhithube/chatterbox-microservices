import { PrismaClient, User } from '@prisma/client';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { Producer } from 'kafkajs';
import { mocked } from 'ts-jest/utils';
import prisma from '../config/prisma';
import producer from '../config/producer';
import {
  createUser,
  CreateUserInput,
  deleteUserByUsername,
  getUserByUsername,
} from './userController';

jest.mock('../config/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

jest.mock('../config/producer', () => ({
  __esModule: true,
  default: mockDeep<Producer>(),
}));

jest.mock('bcrypt');

const prismaMock = mocked(prisma, true);
const producerMock = mocked(producer, true);

beforeEach(() => {
  mockReset(prismaMock);
  mockReset(producerMock);
});

describe('getUserByUsername()', () => {
  test('should get user by username', async () => {
    const user: User = {
      id: '1',
      username: 'test',
      email: 'test@test.com',
      password: 'test',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.user.findUnique.mockResolvedValue(user);

    const res = await getUserByUsername('test');

    expect(res.username).toBe('test');
  });

  test('should throw error if user not found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(getUserByUsername('test')).rejects.toThrow(/not found/);
  });
});

describe('createUser()', () => {
  test('should create user', async () => {
    const createUserInput: CreateUserInput = {
      username: 'test',
      email: 'test@test.com',
      password: 'test',
    };

    const user: User = {
      id: '1',
      username: 'test',
      email: 'test@test.com',
      password: 'test',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.user.create.mockResolvedValue(user);

    const res = await createUser(createUserInput);

    // kafkaMock.producer.mockReturnValue(mockDeep<Producer>());
    // producer.
    expect(producerMock.send).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [
          {
            value: JSON.stringify({ type: 'USER_CREATED', data: user }),
          },
        ],
      })
    );
    expect(res.username).toBe('test');
  });

  test('should throw error if username already taken', async () => {
    const createUserInput: CreateUserInput = {
      username: 'test',
      email: 'test@test.com',
      password: 'test',
    };

    const user: User = {
      id: '1',
      username: 'test',
      email: 'test@test.com',
      password: 'test',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.user.findUnique.mockResolvedValue(user);

    await expect(createUser(createUserInput)).rejects.toThrow(
      /Username already taken/
    );
  });

  test('should throw error if email already taken', async () => {
    const createUserInput: CreateUserInput = {
      username: 'test',
      email: 'test@test.com',
      password: 'test',
    };

    const user: User = {
      id: '1',
      username: 'test',
      email: 'test@test.com',
      password: 'test',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.user.findUnique.mockResolvedValueOnce(user);

    await expect(createUser(createUserInput)).rejects.toThrow(
      /Email already taken/
    );
  });
});

describe('deleteUserByUsername()', () => {
  test('should delete user by username', async () => {
    const user: User = {
      id: '1',
      username: 'test',
      email: 'test@test.com',
      password: 'test',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.user.findUnique.mockResolvedValue(user);
    prismaMock.user.delete.mockResolvedValue(user);

    const res = await deleteUserByUsername('test');

    expect(producerMock.send).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [
          {
            value: JSON.stringify({ type: 'USER_DELETED', data: user }),
          },
        ],
      })
    );
    expect(res.username).toBe('test');
  });

  test('should throw error if user not found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(deleteUserByUsername('test')).rejects.toThrow(/not found/);
  });
});
