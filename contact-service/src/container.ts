import {
  BrokerClient,
  ConfigManager,
  createDotenvManager,
  createKafkaClient,
} from '@chttrbx/common';
import { asFunction, asValue, createContainer } from 'awilix';
import { createSendgridTransport, MailTransport } from './common';
import {
  createUsersConsumer,
  createUsersService,
  UsersConsumer,
  UsersService,
} from './users';

interface ContainerDeps {
  usersConsumer: UsersConsumer;
  usersService: UsersService;
  mailTransport: MailTransport;
  brokerClient: BrokerClient;
  configManager: ConfigManager;
}

export async function configureContainer() {
  const dotenvManager = createDotenvManager();

  const kafkaBroker = await createKafkaClient({
    kafkaConfig: {
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
      groupId: 'contact-consumer-group',
    },
  });

  const sendgridTransport = createSendgridTransport({
    name: dotenvManager.get('EMAIL_NAME'),
    email: dotenvManager.get('EMAIL_ADDRESS'),
    apiKey: dotenvManager.get('SENDGRID_API_KEY'),
  });

  const container = createContainer<ContainerDeps>();

  container.register({
    usersConsumer: asFunction(createUsersConsumer).singleton(),
    usersService: asFunction(createUsersService).singleton(),
    mailTransport: asValue(sendgridTransport),
    brokerClient: asValue(kafkaBroker),
    configManager: asValue(dotenvManager),
  });

  return container;
}
