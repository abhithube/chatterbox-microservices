import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';

beforeAll(async () => {
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: { username: 'test', email: 'test@test.com', password: 'test' },
  });
});

afterAll(async () => {
  await prisma.user.deleteMany();

  await prisma.$disconnect();
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
