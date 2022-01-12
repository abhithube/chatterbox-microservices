import {
  BrokerClient,
  ConfigManager,
  createAxiosClient,
  createDotenvManager,
  createJwtIssuer,
  createKafkaClient,
  createUuidGenerator,
  HttpClient,
  RandomGenerator,
  TokenIssuer,
} from '@chttrbx/common';
import { asFunction, asValue, AwilixContainer, createContainer } from 'awilix';
import { Application, Router } from 'express';
import { MongoClient } from 'mongodb';
import { createApp } from './app';
import { createUsersRepository, UsersRepository } from './repositories';
import { createAccountsRouter, createAuthRouter } from './routes';
import {
  AccountsService,
  AuthService,
  createAccountsService,
  createAuthService,
} from './services';

interface Container {
  app: Application;
  accountsRouter: Router;
  authRouter: Router;
  accountsService: AccountsService;
  authService: AuthService;
  usersRepository: UsersRepository;
  dbClient: MongoClient;
  brokerClient: BrokerClient;
  tokenIssuer: TokenIssuer;
  randomGenerator: RandomGenerator;
  httpClient: HttpClient;
  configManager: ConfigManager;
}

export async function configureContainer(): Promise<
  AwilixContainer<Container>
> {
  const dotenvManager = createDotenvManager();

  const databaseUrl = dotenvManager.get('DATABASE_URL');
  if (!databaseUrl) {
    throw new Error('Database URL missing');
  }

  const mongo = new MongoClient(databaseUrl);
  const mongoClient = await mongo.connect();

  const jwtIssuer = createJwtIssuer({
    secretOrKey: dotenvManager.get('JWT_SECRET') || 'secret',
    expiresIn: '15m',
  });

  let kafkaClient: BrokerClient = {} as BrokerClient;
  const brokerUrls = dotenvManager.get('BROKER_URLS');
  const kafkaUser = dotenvManager.get('KAFKA_USER');
  const kafkaPass = dotenvManager.get('KAFKA_PASS');

  if (!brokerUrls || !kafkaUser || !kafkaPass) {
    throw new Error('Kafka config missing');
  }

  kafkaClient = await createKafkaClient({
    kafkaConfig: {
      clientId: 'accounts-client',
      brokers: brokerUrls.split(','),
      ssl: true,
      sasl: {
        mechanism: 'scram-sha-256',
        username: kafkaUser,
        password: kafkaPass,
      },
    },
  });

  const container = createContainer<Container>();

  container.register({
    app: asFunction(createApp).singleton(),
    accountsRouter: asFunction(createAccountsRouter).singleton(),
    authRouter: asFunction(createAuthRouter).singleton(),
    accountsService: asFunction(createAccountsService).singleton(),
    authService: asFunction(createAuthService).singleton(),
    usersRepository: asFunction(createUsersRepository).singleton(),
    dbClient: asValue(mongoClient),
    brokerClient: asValue(kafkaClient),
    tokenIssuer: asValue(jwtIssuer),
    randomGenerator: asFunction(createUuidGenerator).singleton(),
    httpClient: asFunction(createAxiosClient).singleton(),
    configManager: asValue(dotenvManager),
  });

  return container;
}
