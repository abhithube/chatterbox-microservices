import {
  BrokerClient,
  CacheManager,
  ConfigManager,
  createDotenvManager,
  createJwtIssuer,
  createKafkaClient,
  createRedisManager,
  createUuidGenerator,
  RandomGenerator,
  TokenIssuer,
} from '@chttrbx/common';
import { asFunction, asValue, AwilixContainer, createContainer } from 'awilix';
import { Application, Router } from 'express';
import { Server as HttpServer } from 'http';
import { Client } from 'pg';
import { Server as IoServer } from 'socket.io';
import { createApp } from './app';
import { createHttpServer } from './httpServer';
import {
  createMessagesGateway,
  createMessagesRepository,
  createMessagesService,
  MessagesGateway,
  MessagesRepository,
  MessagesService,
} from './messages';
import {
  createMembersRepository,
  createPartiesRepository,
  createPartiesRouter,
  createPartiesService,
  createTopicsRepository,
  MembersRepository,
  PartiesRepository,
  PartiesService,
  TopicsRepository,
} from './parties';
import { createSocketServer } from './socketServer';
import {
  createUsersConsumer,
  createUsersRepository,
  createUsersService,
  UsersConsumer,
  UsersRepository,
  UsersService,
} from './users';

interface Container {
  httpServer: HttpServer;
  socketServer: IoServer;
  app: Application;
  partiesRouter: Router;
  messagesGateway: MessagesGateway;
  usersConsumer: UsersConsumer;
  partiesService: PartiesService;
  messagesService: MessagesService;
  usersService: UsersService;
  partiesRepository: PartiesRepository;
  topicsRepository: TopicsRepository;
  membersRepository: MembersRepository;
  messagesRepository: MessagesRepository;
  usersRepository: UsersRepository;
  randomGenerator: RandomGenerator;
  dbClient: Client;
  brokerClient: BrokerClient;
  cacheManager: CacheManager;
  tokenIssuer: TokenIssuer;
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

  const postgresClient = new Client({
    connectionString: dotenvManager.get('DATABASE_URL'),
    ssl:
      dotenvManager.get('NODE_ENV') === 'production'
        ? {
            rejectUnauthorized: false,
          }
        : false,
  });

  postgresClient.connect();

  const jwtIssuer = createJwtIssuer({
    secretOrKey: dotenvManager.get('JWT_SECRET') || 'secret',
    expiresIn: '15m',
  });

  const redisManager = createRedisManager({
    url: dotenvManager.get('REDIS_URL'),
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
          clientId: 'messages-client',
          brokers: brokerUrls.split(','),
          ssl: true,
          sasl: {
            mechanism: 'plain',
            username: kafkaUser,
            password: kafkaPass,
          },
        },
        consumerConfig: {
          groupId: 'messages-consumer-group',
        },
      });
    } else {
      kafkaClient = await createKafkaClient({
        kafkaConfig: {
          brokers: brokerUrls.split(','),
        },
        consumerConfig: {
          groupId: 'messages-consumer-group',
        },
      });
    }
  }

  const container = createContainer<Container>();

  container.register({
    httpServer: asFunction(createHttpServer).singleton(),
    socketServer: asFunction(createSocketServer).singleton(),
    app: asFunction(createApp).singleton(),
    partiesRouter: asFunction(createPartiesRouter).singleton(),
    messagesGateway: asFunction(createMessagesGateway).singleton(),
    usersConsumer: asFunction(createUsersConsumer).singleton(),
    partiesService: asFunction(createPartiesService).singleton(),
    messagesService: asFunction(createMessagesService).singleton(),
    usersService: asFunction(createUsersService).singleton(),
    partiesRepository: asFunction(createPartiesRepository).singleton(),
    topicsRepository: asFunction(createTopicsRepository).singleton(),
    membersRepository: asFunction(createMembersRepository).singleton(),
    messagesRepository: asFunction(createMessagesRepository).singleton(),
    usersRepository: asFunction(createUsersRepository).singleton(),
    randomGenerator: asFunction(createUuidGenerator).singleton(),
    dbClient: asValue(postgresClient),
    brokerClient: asValue(kafkaClient),
    cacheManager: asValue(redisManager),
    tokenIssuer: asValue(jwtIssuer),
    configManager: asValue(dotenvManager),
  });

  return container;
}
