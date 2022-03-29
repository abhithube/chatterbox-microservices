import {
  BrokerClient,
  ConfigManager,
  createDotenvManager,
  createJwtIssuer,
  createKafkaClient,
  createUuidGenerator,
  RandomGenerator,
  TokenIssuer,
} from '@chttrbx/common';
import { asFunction, asValue, AwilixContainer, createContainer } from 'awilix';
import { Application, Router } from 'express';
import { Server as HttpServer } from 'http';
import Redis from 'ioredis';
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
  redisClient: Redis;
  tokenIssuer: TokenIssuer;
  configManager: ConfigManager;
}

export async function configureContainer(): Promise<
  AwilixContainer<Container>
> {
  const dotenvManager = createDotenvManager();

  const databaseUrl = dotenvManager.get('DATABASE_URL');
  if (!databaseUrl) {
    throw new Error('Database config missing');
  }

  const postgresClient = new Client({
    connectionString: dotenvManager.get('DATABASE_URL'),
  });

  postgresClient.connect();

  const jwtIssuer = createJwtIssuer({
    secretOrKey: dotenvManager.get('JWT_SECRET') || 'secret',
    expiresIn: '15m',
  });

  const redisClient = new Redis(dotenvManager.get('REDIS_URL')!);

  let kafkaClient: BrokerClient = {} as BrokerClient;
  const brokerUrls = dotenvManager.get('BROKER_URLS');
  const kafkaUser = dotenvManager.get('KAFKA_USER');
  const kafkaPass = dotenvManager.get('KAFKA_PASS');

  if (!brokerUrls || !kafkaUser || !kafkaPass) {
    throw new Error('Kafka config missing');
  }

  kafkaClient = await createKafkaClient({
    kafkaConfig: {
      clientId: 'messages-client',
      brokers: brokerUrls.split(','),
      ssl: true,
      sasl: {
        mechanism: 'scram-sha-256',
        username: kafkaUser,
        password: kafkaPass,
      },
    },
    consumerConfig: {
      groupId: 'messages-consumer-group',
    },
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
    topicsRepository: asFunction(createTopicsRepository).singleton(),
    membersRepository: asFunction(createMembersRepository).singleton(),
    messagesRepository: asFunction(createMessagesRepository).singleton(),
    usersRepository: asFunction(createUsersRepository).singleton(),
    randomGenerator: asFunction(createUuidGenerator).singleton(),
    dbClient: asValue(postgresClient),
    brokerClient: asValue(kafkaClient),
    redisClient: asValue(redisClient),
    tokenIssuer: asValue(jwtIssuer),
    configManager: asValue(dotenvManager),
  });

  return container;
}
