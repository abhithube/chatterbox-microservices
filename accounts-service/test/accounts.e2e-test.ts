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
import { configureContainer } from '../src/container';

describe('Accounts', () => {
  let app: Application;

  let dbClient: MongoClient;
  let usersRepository: UsersRepository;
  let tokenIssuer: TokenIssuer;
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
    randomGenerator = container.resolve('randomGenerator');
  });

  beforeEach(async () => {
    user = await usersRepository.insertOne({
      id: randomGenerator.generate(),
      username: 'user',
      email: 'user@email.com',
      avatarUrl: null,
    });

    accessToken = tokenIssuer.generate({
      id: user.id,
    });
  });

  afterEach(async () => {
    await usersRepository.deleteMany();
  });

  afterAll(async () => {
    await dbClient.close();
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
