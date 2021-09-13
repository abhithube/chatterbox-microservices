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

const newAccount = 'newAccount';
const verifiedAccount = 'verifiedAccount';
const unverifiedAccount = 'unverifiedAccount';

const registerDto: RegisterDto = {
  username: newAccount,
  email: `${newAccount}@test.com`,
  password: newAccount,
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

    const oldUrl = process.env.DATABASE_URL!;
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
      id: verifiedAccount,
      username: verifiedAccount,
      email: verifiedAccount,
      avatarUrl: null,
      password: passwordHasher.hashSync(verifiedAccount),
      verified: true,
      verificationToken: randomGenerator.generate(),
      resetToken: randomGenerator.generate(),
    });

    unverifiedUser = await usersRepository.insertOne({
      id: unverifiedAccount,
      username: unverifiedAccount,
      email: unverifiedAccount,
      avatarUrl: null,
      password: passwordHasher.hashSync(unverifiedAccount),
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
      password: 'newpass',
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
