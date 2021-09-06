import { createKafkaServiceMock, JwtService } from '@chttrbx/common';
import { asFunction } from 'awilix';
import { Application } from 'express';
import mongoose from 'mongoose';
import request from 'supertest';
import { LoginResponseDto, RefreshResponseDto } from '../src/auth';
import { container } from '../src/container';
import {
  PasswordHasher,
  RandomGenerator,
  UserDocument,
  UsersRepository,
} from '../src/shared';

const verified = 'verified';

describe('Auth', () => {
  let app: Application;

  let usersRepository: UsersRepository;
  let jwtService: JwtService;
  let passwordHasher: PasswordHasher;
  let randomGenerator: RandomGenerator;

  let verifiedUser: UserDocument;
  let accessToken: string;

  beforeAll(async () => {
    container.register({
      kafkaService: asFunction(createKafkaServiceMock).singleton(),
    });

    app = await container.resolve('app').init();

    usersRepository = container.resolve('usersRepository');
    jwtService = container.resolve('jwtService');
    passwordHasher = container.resolve('passwordHasher');
    randomGenerator = container.resolve('randomGenerator');
  });

  beforeEach(async () => {
    verifiedUser = await usersRepository.insertOne({
      username: verified,
      email: verified,
      avatarUrl: null,
      password: passwordHasher.hashSync(verified),
      verified: true,
      verificationToken: randomGenerator.generate(),
      resetToken: randomGenerator.generate(),
    });

    accessToken = jwtService.sign({
      id: verifiedUser.id,
      username: verifiedUser.username,
      avatarUrl: verifiedUser.avatarUrl,
    });
  });

  afterEach(async () => {
    await usersRepository.deleteMany();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('POST /auth/login - logs in a verified user', async () => {
    const res = await request(app).post('/auth/login').send({
      username: verifiedUser.username,
      password: verified,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual<LoginResponseDto>({
      user: expect.objectContaining({
        id: verifiedUser.id,
      }),
      accessToken: expect.any(String),
    });

    expect(res.headers['set-cookie']).toContainEqual(
      expect.stringContaining('refresh')
    );
  });

  it('GET /auth/@me - fetches the current user', async () => {
    const res = await request(app)
      .get('/auth/@me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        id: verifiedUser.id,
      })
    );
  });

  it("POST /auth/refresh - refresh a user's access token", async () => {
    const refreshToken = jwtService.sign({
      id: verifiedUser.id,
      username: verifiedUser.username,
      avatarUrl: verifiedUser.avatarUrl,
    });

    const res = await request(app)
      .post('/auth/refresh')
      .set('Cookie', `refresh=${refreshToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual<RefreshResponseDto>({
      accessToken: expect.any(String),
    });
  });

  it('POST /auth/logout - logs out the current user', async () => {
    const res = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);

    expect(res.headers['set-cookie']).toContainEqual(
      expect.stringContaining('refresh=;')
    );
  });
});
