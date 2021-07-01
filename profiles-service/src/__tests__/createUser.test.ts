import { mockDeep } from 'jest-mock-extended';
import { Producer } from 'kafkajs';
import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';
import { CreateUserInput } from '../controllers/userController';

jest.mock('../config/producer', () => ({
  __esModule: true,
  default: mockDeep<Producer>(),
}));

beforeAll(async () => {
  await prisma.$connect();

  await prisma.user.create({
    data: { username: 'test', email: 'test@test.com' },
  });
});

afterAll(async () => {
  await prisma.user.deleteMany();

  await prisma.$disconnect();
});

describe('POST /api/users', () => {
  test('should register a new user', async () => {
    const user: CreateUserInput = {
      username: 'new1',
      email: 'new1@new.com',
      password: 'new1',
    };

    const res = await request(app).post('/api/users').send(user);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('username', 'new1');
  });

  test('should 400 if username already taken', async () => {
    const user: CreateUserInput = {
      username: 'test',
      email: 'new2@new.com',
      password: 'new2',
    };

    const res = await request(app).post('/api/users').send(user);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Username already taken');
  });

  test('should 400 if email already taken', async () => {
    const user: CreateUserInput = {
      username: 'new3',
      email: 'test@test.com',
      password: 'new3',
    };

    const res = await request(app).post('/api/users').send(user);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Email already taken');
  });
});
