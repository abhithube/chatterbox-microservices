import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import * as request from 'supertest';
import { KafkaService } from '../src/kafka/kafka.service';
import { CreateUserDto } from '../src/users/dto/create-user.dto';
import { UsersModule } from '../src/users/users.module';

const existingUser: CreateUserDto = {
  username: 'existinguser',
  email: 'existinguser@test.com',
  password: 'pass',
};

const newUser: CreateUserDto = {
  username: 'newuser',
  email: 'newuser@test.com',
  password: 'pass',
};

describe('Users', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  let userId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UsersModule, ConfigModule],
    })
      .overrideProvider(KafkaService)
      .useValue({
        publish: jest.fn(),
      })
      .compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get<PrismaClient>(PrismaClient);

    await app.init();
  });

  beforeEach(async () => {
    const user = await prisma.user.create({
      data: {
        username: existingUser.username,
        email: existingUser.email,
      },
    });

    userId = user.id;
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it(`POST /users - creates a new user`, async () => {
    const res = await request(app.getHttpServer()).post('/users').send(newUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      id: expect.any(String),
      username: 'newuser',
      email: 'newuser@test.com',
      avatarUrl: null,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it(`POST /users - returns 400 if username/email already taken`, async () => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .send(existingUser);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      message: 'Username already taken',
    });
  });

  it(`GET /users/:id - fetches an existing user`, async () => {
    const res = await request(app.getHttpServer()).get(`/users/${userId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      id: expect.any(String),
      username: 'existinguser',
      email: 'existinguser@test.com',
      avatarUrl: null,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it(`GET /users/:id - returns 404 if user not found`, async () => {
    const res = await request(app.getHttpServer()).get(
      '/users/000000000000000000000000',
    );

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      message: 'User not found',
    });
  });

  it(`DELETE /users/:id - deletes an existing user`, async () => {
    const res = await request(app.getHttpServer()).delete(`/users/${userId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      id: expect.any(String),
      username: 'existinguser',
      email: 'existinguser@test.com',
      avatarUrl: null,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it(`DELETE /users/:id - returns 404 if user not found`, async () => {
    const res = await request(app.getHttpServer()).delete(
      '/users/000000000000000000000000',
    );

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      message: 'User not found',
    });
  });
});
