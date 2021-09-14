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
  cacheManager: CacheManager;
  tokenIssuer: TokenIssuer;
  brokerClient: BrokerClient;
  configManager: ConfigManager;
}

export async function configureContainer() {
  const dotenvManager = createDotenvManager();

  const mongoConnection = await createMongoConnection({
    url: dotenvManager.get('DATABASE_URL'),
  });

  const kafkaBroker = await createKafkaClient({
    kafkaConfig: {
      clientId: 'messages-client',
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
    consumerConfig: {
      groupId: 'messages-consumer-group',
    },
  });

  const redisManager = createRedisManager({
    url: dotenvManager.get('REDIS_URL'),
  });

  const jwtIssuer = createJwtIssuer({
    secretOrKey: dotenvManager.get('JWT_SECRET'),
  });

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
    cacheManager: asValue(redisManager),
    tokenIssuer: asValue(jwtIssuer),
    brokerClient: asValue(kafkaBroker),
    configManager: asValue(dotenvManager),
  });

  return container;
}
