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
import {
  AccountsService,
  createAccountsRouter,
  createAccountsService,
  createUsersRepository,
  UsersRepository,
} from './accounts';
import { createApp } from './app';
import { AuthService, createAuthRouter, createAuthService } from './auth';
import { createBcryptHasher, PasswordHasher } from './common';

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
  passwordHasher: PasswordHasher;
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

  if (brokerUrls) {
    if (dotenvManager.get('NODE_ENV') === 'production') {
      if (!kafkaUser || !kafkaPass) {
        throw new Error('Kafka credentials missing');
      }

      kafkaClient = await createKafkaClient({
        kafkaConfig: {
          clientId: 'auth-client',
          brokers: brokerUrls.split(','),
          ssl: true,
          sasl: {
            mechanism: 'plain',
            username: kafkaUser,
            password: kafkaPass,
          },
        },
      });
    } else {
      kafkaClient = await createKafkaClient({
        kafkaConfig: {
          clientId: 'auth-client',
          brokers: brokerUrls.split(','),
        },
      });
    }
  }

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
    passwordHasher: asFunction(createBcryptHasher).singleton(),
    randomGenerator: asFunction(createUuidGenerator).singleton(),
    httpClient: asFunction(createAxiosClient).singleton(),
    configManager: asValue(dotenvManager),
  });

  return container;
}
