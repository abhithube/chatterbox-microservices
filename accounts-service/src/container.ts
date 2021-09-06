import {
  createJwtService,
  createKafkaService,
  JwtService,
  KafkaService,
} from '@chttrbx/common';
import { asFunction, createContainer } from 'awilix';
import { Router } from 'express';
import {
  AccountsService,
  createAccountsRouter,
  createAccountsService,
} from './accounts';
import { App, createApp } from './app';
import { AuthService, createAuthRouter, createAuthService } from './auth';
import {
  creatAxiosClient,
  createBcryptHasher,
  createUsersRepository,
  createUuidGenerator,
  HttpClient,
  PasswordHasher,
  RandomGenerator,
  UsersRepository,
} from './shared';

interface Container {
  app: App;
  accountsRouter: Router;
  authRouter: Router;
  accountsService: AccountsService;
  authService: AuthService;
  usersRepository: UsersRepository;
  jwtService: JwtService;
  kafkaService: KafkaService;
  httpClient: HttpClient;
  passwordHasher: PasswordHasher;
  randomGenerator: RandomGenerator;
}

const container = createContainer<Container>();

container.register({
  app: asFunction(createApp).singleton(),
  accountsRouter: asFunction(createAccountsRouter).singleton(),
  authRouter: asFunction(createAuthRouter).singleton(),
  accountsService: asFunction(createAccountsService).singleton(),
  authService: asFunction(createAuthService).singleton(),
  usersRepository: asFunction(createUsersRepository).singleton(),
  jwtService: asFunction(() =>
    createJwtService({
      secretOrKey: process.env.JWT_SECRET!,
      expiresIn: '15m',
    })
  ).singleton(),
  kafkaService: asFunction(() =>
    createKafkaService({
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
    })
  ).singleton(),
  httpClient: asFunction(creatAxiosClient).singleton(),
  passwordHasher: asFunction(createBcryptHasher).singleton(),
  randomGenerator: asFunction(createUuidGenerator).singleton(),
});

export { container };
