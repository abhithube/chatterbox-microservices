import { mockDeep } from 'jest-mock-extended';
import { Kafka } from 'kafkajs';
import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';
import { CreateUserInput } from '../controllers/userController';

jest.mock('../config/kafka', () => ({
  __esModule: true,
  default: mockDeep<Kafka>(),
}));

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/users', () => {
  beforeEach(async () => {
    await prisma.user.create({
      data: { username: 'test', email: 'test@test.com', password: 'test' },
    });
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  test('should register a new user', async () => {
    const user: CreateUserInput = {
      username: 'new',
      email: 'new@new.com',
      password: 'new',
    };

    const res = await request(app).post('/api/users').send(user);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('username', 'new');
  });

  test('should 400 if username already taken', async () => {
    const user: CreateUserInput = {
      username: 'test',
      email: 'new@new.com',
      password: 'new',
    };

    const res = await request(app).post('/api/users').send(user);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Username already taken');
  });

  test('should 400 if email already taken', async () => {
    const user: CreateUserInput = {
      username: 'new',
      email: 'test@test.com',
      password: 'new',
    };

    const res = await request(app).post('/api/users').send(user);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Email already taken');
  });
});
