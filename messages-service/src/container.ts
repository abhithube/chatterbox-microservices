import {
  BrokerClient,
  CacheManager,
  ConfigManager,
  createDotenvManager,
  createJwtIssuer,
  createKafkaClient,
  createMongoConnection,
  createRedisManager,
  DbConnection,
  MongoClient,
  TokenIssuer,
} from '@chttrbx/common';
import { asFunction, asValue, createContainer } from 'awilix';
import { Application, Router } from 'express';
import { Server as HttpServer } from 'http';
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
  createPartiesRepository,
  createPartiesRouter,
  createPartiesService,
  PartiesRepository,
  PartiesService,
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
  messagesRepository: MessagesRepository;
  usersRepository: UsersRepository;
  dbConnection: DbConnection<MongoClient>;
  brokerClient: BrokerClient;
  cacheManager: CacheManager;
  tokenIssuer: TokenIssuer;
  configManager: ConfigManager;
}

export async function configureContainer() {
  const dotenvManager = createDotenvManager();

  const databaseUrl = dotenvManager.get('DATABASE_URL');
  if (!databaseUrl) {
    throw new Error('Database URL missing');
  }

  const mongoConnection = await createMongoConnection({
    url: databaseUrl,
  });

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
    messagesRepository: asFunction(createMessagesRepository).singleton(),
    usersRepository: asFunction(createUsersRepository).singleton(),
    dbConnection: asValue(mongoConnection),
    brokerClient: asValue(kafkaClient),
    cacheManager: asValue(redisManager),
    tokenIssuer: asValue(jwtIssuer),
    configManager: asValue(dotenvManager),
  });

  return container;
}
