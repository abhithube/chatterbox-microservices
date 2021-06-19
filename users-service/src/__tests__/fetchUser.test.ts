import { mockDeep } from 'jest-mock-extended';
import { Kafka } from 'kafkajs';
import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';

jest.mock('../config/kafka', () => ({
  __esModule: true,
  default: mockDeep<Kafka>(),
}));
jest.mock('../config/initializeTopics', () => jest.fn());

let id: string;
beforeAll(async () => {
  await prisma.$connect();

  const user = await prisma.user.create({
    data: { username: 'test', email: 'test@test.com', password: 'test' },
  });

  id = user.id;
});

afterAll(async () => {
  await prisma.user.deleteMany();

  await prisma.$disconnect();
});

describe('GET /api/users/:username', () => {
  test('should fetch an existing user', async () => {
    const res = await request(app).get(`/api/users/${id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('username', 'test');
  });

  test('should 404 if user does not exist', async () => {
    const res = await request(app).get('/api/users/123456123456123456123456');

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'User not found');
  });
});
