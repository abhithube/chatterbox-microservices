import {
  BrokerClient,
  CacheManager,
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
  server: HttpServer;
  app: Application;
  socketServer: IoServer;
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
}

export async function configureContainer() {
  const mongoConnection = await createMongoConnection({
    url: process.env.DATABASE_URL!,
  });

  const kafkaBroker = await createKafkaClient({
    kafkaConfig: {
      clientId: 'messages-client',
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
    consumerConfig: {
      groupId: 'messages-consumer-group',
    },
  });

  const redisManager = createRedisManager({
    url: process.env.REDIS_URL,
  });

  const jwtIssuer = createJwtIssuer({
    secretOrKey: process.env.JWT_SECRET!,
  });

  const container = createContainer<Container>();

  container.register({
    server: asFunction(createHttpServer).singleton(),
    app: asFunction(createApp).singleton(),
    socketServer: asFunction(createSocketServer).singleton(),
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
  });

  return container;
}
