import {
  createBrokerClientMock,
  RandomGenerator,
  TokenIssuer,
} from '@chttrbx/common';
import { asFunction, asValue } from 'awilix';
import { Application } from 'express';
import { MongoClient } from 'mongodb';
import request from 'supertest';
import { User, UsersRepository } from '../src/accounts';
import { LoginResponseDto, RefreshResponseDto } from '../src/auth';
import { PasswordHasher } from '../src/common';
import { configureContainer } from '../src/container';

const password = 'password';

describe('Auth', () => {
  let app: Application;

  let dbClient: MongoClient;
  let usersRepository: UsersRepository;
  let tokenIssuer: TokenIssuer;
  let passwordHasher: PasswordHasher;
  let randomGenerator: RandomGenerator;

  let user: User;
  let accessToken: string;

  beforeAll(async () => {
    const container = await configureContainer();

    dbClient = container.resolve('dbClient');
    dbClient.close();

    const configManager = container.resolve('configManager');

    const databaseUrl = configManager.get('DATABASE_URL');
    if (!databaseUrl) {
      process.exit(1);
    }

    const mongo = new MongoClient(databaseUrl);
    dbClient = await mongo.connect();

    container.register({
      dbClient: asValue(dbClient),
      brokerClient: asFunction(createBrokerClientMock).singleton(),
    });

    app = container.resolve('app');

    usersRepository = container.resolve('usersRepository');
    tokenIssuer = container.resolve('tokenIssuer');
    passwordHasher = container.resolve('passwordHasher');
    randomGenerator = container.resolve('randomGenerator');

    await usersRepository.deleteMany({});
  });

  beforeEach(async () => {
    user = await usersRepository.insertOne({
      id: randomGenerator.generate(),
      username: 'username',
      email: 'email',
      avatarUrl: null,
      password: passwordHasher.hashSync(password),
      verified: true,
      verificationToken: randomGenerator.generate(),
      resetToken: randomGenerator.generate(),
    });

    accessToken = tokenIssuer.generate({
      id: user.id,
    });
  });

  afterEach(async () => {
    await usersRepository.deleteMany({});
  });

  afterAll(async () => {
    await dbClient.close();
  });

  it('POST /auth/login - logs in a value user', async () => {
    const res = await request(app).post('/auth/login').send({
      username: user.username,
      password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual<LoginResponseDto>({
      user: expect.objectContaining({
        id: user.id,
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
        id: user.id,
      })
    );
  });

  it("POST /auth/refresh - refresh a user's access token", async () => {
    const refreshToken = tokenIssuer.generate({
      id: user.id,
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
