import {
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
  MongoClient,
  RandomGenerator,
  TokenIssuer,
} from '@chttrbx/common';
import { asFunction, asValue, AwilixContainer, createContainer } from 'awilix';
import { Application, Router } from 'express';
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
  dbConnection: DbConnection<MongoClient>;
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
    process.exit(1);
  }

  const mongoConnection = await createMongoConnection({
    url: databaseUrl,
  });

  const jwtSecret = dotenvManager.get('JWT_SECRET');
  if (!jwtSecret) {
    process.exit(1);
  }

  const jwtIssuer = createJwtIssuer({
    secretOrKey: jwtSecret,
    expiresIn: '15m',
  });

  let kafkaClient: BrokerClient = {} as BrokerClient;
  const brokerUrls = dotenvManager.get('BROKER_URLS');
  const kafkaUsername = dotenvManager.get('KAFKA_USERNAME');
  const kafkaPassword = dotenvManager.get('KAFKA_PASSWORD');

  if (brokerUrls) {
    if (dotenvManager.get('NODE_ENV') === 'production') {
      if (!kafkaUsername || !kafkaPassword) {
        process.exit(1);
      }

      kafkaClient = await createKafkaClient({
        kafkaConfig: {
          clientId: 'auth-client',
          brokers: brokerUrls.split(','),
          ssl: true,
          sasl: {
            mechanism: 'plain',
            username: kafkaUsername,
            password: kafkaPassword,
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
    dbConnection: asValue(mongoConnection),
    brokerClient: asValue(kafkaClient),
    tokenIssuer: asValue(jwtIssuer),
    passwordHasher: asFunction(createBcryptHasher).singleton(),
    randomGenerator: asFunction(createUuidGenerator).singleton(),
    httpClient: asFunction(createAxiosClient).singleton(),
    configManager: asValue(dotenvManager),
  });

  return container;
}
