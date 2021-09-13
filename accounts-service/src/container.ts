import {
  BaseRepository,
  BrokerClient,
  createAxiosClient,
  createJwtIssuer,
  createKafkaClient,
  createMongoConnection,
  createUuidGenerator,
  DbConnection,
  HttpClient,
  RandomGenerator,
  TokenIssuer,
} from '@chttrbx/common';
import { asFunction, asValue, createContainer } from 'awilix';
import { Application, Router } from 'express';
import {
  AccountsService,
  createAccountsRouter,
  createAccountsService,
  createUsersRepository,
  User,
} from './accounts';
import { createApp } from './app';
import { AuthService, createAuthRouter, createAuthService } from './auth';
import { createBcryptHasher, PasswordHasher } from './common';

interface Container {
  app: Application;
  dbConnection: DbConnection;
  accountsRouter: Router;
  authRouter: Router;
  accountsService: AccountsService;
  authService: AuthService;
  usersRepository: BaseRepository<User>;
  tokenIssuer: TokenIssuer;
  brokerClient: BrokerClient;
  httpClient: HttpClient;
  passwordHasher: PasswordHasher;
  randomGenerator: RandomGenerator;
}

export async function configureContainer() {
  const mongoConnection = await createMongoConnection({
    url: process.env.DATABASE_URL!,
  });

  const jwtIssuer = createJwtIssuer({
    secretOrKey: process.env.JWT_SECRET!,
    expiresIn: '15m',
  });

  const kafkaBroker = await createKafkaClient({
    kafkaConfig: {
      clientId: 'auth-client',
      brokers: process.env.BROKER_URLS!.split(','),
      ssl: process.env.NODE_ENV === 'production',
      sasl:
        process.env.NODE_ENV === 'production'
          ? {
              mechanism: 'plain',
              username: process.env.CONFLUENT_API_KEY!,
              password: process.env.CONFLUENT_API_SECRET!,
            }
          : undefined,
    },
  });

  const container = createContainer<Container>();

  container.register({
    app: asFunction(createApp).singleton(),
    dbConnection: asValue(mongoConnection),
    accountsRouter: asFunction(createAccountsRouter).singleton(),
    authRouter: asFunction(createAuthRouter).singleton(),
    accountsService: asFunction(createAccountsService).singleton(),
    authService: asFunction(createAuthService).singleton(),
    usersRepository: asFunction(createUsersRepository).singleton(),
    tokenIssuer: asValue(jwtIssuer),
    brokerClient: asValue(kafkaBroker),
    httpClient: asFunction(createAxiosClient).singleton(),
    passwordHasher: asFunction(createBcryptHasher).singleton(),
    randomGenerator: asFunction(createUuidGenerator).singleton(),
  });

  return container;
}
