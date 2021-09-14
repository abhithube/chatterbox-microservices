import {
  BaseRepository,
  BrokerClient,
  ConfigManager,
  createAxiosClient,
  createDotenvManager,
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
  configManager: ConfigManager;
}

export async function configureContainer() {
  const dotenvManager = createDotenvManager();

  const mongoConnection = await createMongoConnection({
    url: dotenvManager.get('DATABASE_URL'),
  });

  const jwtIssuer = createJwtIssuer({
    secretOrKey: dotenvManager.get('JWT_SECRET'),
    expiresIn: '15m',
  });

  const kafkaBroker = await createKafkaClient({
    kafkaConfig: {
      clientId: 'auth-client',
      brokers: dotenvManager.get('BROKER_URLS').split(','),
      ssl: dotenvManager.get('NODE_ENV') === 'production',
      sasl:
        dotenvManager.get('NODE_ENV') === 'production'
          ? {
              mechanism: 'plain',
              username: dotenvManager.get('CONFLUENT_API_KEY'),
              password: dotenvManager.get('CONFLUENT_API_SECRET'),
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
    configManager: asValue(dotenvManager),
  });

  return container;
}
