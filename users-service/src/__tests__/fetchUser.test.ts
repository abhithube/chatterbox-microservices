import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('GET /api/users/:username', () => {
  beforeEach(async () => {
    await prisma.user.create({
      data: { username: 'test', email: 'test@test.com', password: 'test' },
    });
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  test('should fetch an existing user', async () => {
    const res = await request(app).get('/api/users/test');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('username', 'test');
  });

  test('should 404 if user does not exist', async () => {
    const res = await request(app).get('/api/users/not-here');

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'User not found');
  });
});
