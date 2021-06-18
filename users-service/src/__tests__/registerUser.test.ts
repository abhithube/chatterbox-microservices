import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';
import producer from '../config/producer';
import { CreateUserInput } from '../controllers/userController';

beforeAll(async () => {
  await prisma.$connect();

  await prisma.user.create({
    data: { username: 'test', email: 'test@test.com', password: 'test' },
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

    const spy = jest.spyOn(producer, 'send');

    const res = await request(app).post('/api/users').send(user);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('username', 'new1');
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [
          {
            value: JSON.stringify({ type: 'USER_CREATED', data: res.body }),
          },
        ],
      })
    );
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
