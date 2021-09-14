import {
  BaseRepository,
  createBrokerClientMock,
  createMongoConnection,
  RandomGenerator,
  TokenIssuer,
} from '@chttrbx/common';
import { asFunction, asValue } from 'awilix';
import { Application } from 'express';
import request from 'supertest';
import { RegisterDto, User } from '../src/accounts';
import { PasswordHasher } from '../src/common';
import { configureContainer } from '../src/container';

const registerDto: RegisterDto = {
  username: 'new',
  email: `new@test.com`,
  password: 'new',
};

describe('Accounts', () => {
  let app: Application;

  let usersRepository: BaseRepository<User>;
  let tokenIssuer: TokenIssuer;
  let passwordHasher: PasswordHasher;
  let randomGenerator: RandomGenerator;

  let verifiedUser: User;
  let unverifiedUser: User;
  let accessToken: string;

  beforeAll(async () => {
    const container = await configureContainer();

    const configManager = container.resolve('configManager');

    const oldUrl = configManager.get('DATABASE_URL');
    const url = `${oldUrl.substring(0, oldUrl.lastIndexOf('/'))}/accounts-test`;

    const mongoConnection = await createMongoConnection({
      url,
    });

    container.register({
      dbConnection: asValue(mongoConnection),
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
    verifiedUser = await usersRepository.insertOne({
      id: randomGenerator.generate(),
      username: 'verified',
      email: 'verified@test.com',
      avatarUrl: null,
      password: passwordHasher.hashSync('verified'),
      verified: true,
      verificationToken: null,
      resetToken: randomGenerator.generate(),
    });

    unverifiedUser = await usersRepository.insertOne({
      id: randomGenerator.generate(),
      username: 'unverified',
      email: 'unverified@test.com',
      avatarUrl: null,
      password: passwordHasher.hashSync('unverified'),
      verified: false,
      verificationToken: randomGenerator.generate(),
      resetToken: randomGenerator.generate(),
    });

    accessToken = tokenIssuer.generate({
      id: verifiedUser.id,
    });
  });

  afterEach(async () => {
    await usersRepository.deleteMany({});
  });

  it('POST /accounts - registers a new user', async () => {
    const res = await request(app).post('/accounts').send(registerDto);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(
      expect.objectContaining({
        username: registerDto.username,
      })
    );
  });

  it("POST /accounts/confirm - verifies a new user's email address", async () => {
    const res = await request(app).post('/accounts/confirm').send({
      token: unverifiedUser.verificationToken,
    });

    expect(res.statusCode).toBe(200);
  });

  it('POST /accounts/forgot - sends a password reset email', async () => {
    const res = await request(app).post('/accounts/forgot').send({
      email: verifiedUser.email,
    });

    expect(res.statusCode).toBe(200);
  });

  it("POST /accounts/reset - resets a user's password", async () => {
    const res = await request(app).post('/accounts/reset').send({
      token: verifiedUser.resetToken,
      password: 'password',
    });

    expect(res.statusCode).toBe(200);
  });

  it('DELETE /accounts/@me - deletes the current user', async () => {
    const res = await request(app)
      .delete('/accounts/@me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);

    expect(res.headers['set-cookie']).toContainEqual(
      expect.stringContaining('refresh=;')
    );
  });
});
