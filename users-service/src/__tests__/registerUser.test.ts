import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';
import producer from '../config/producer';
import { CreateUserInput } from '../controllers/userController';

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

    const spy = jest.spyOn(producer, 'send');

    const res = await request(app).post('/api/users').send(user);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('username', 'new');
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
