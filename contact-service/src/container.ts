import {
  BrokerClient,
  ConfigManager,
  createDotenvManager,
  createKafkaClient,
} from '@chttrbx/common';
import { asFunction, asValue, AwilixContainer, createContainer } from 'awilix';
import { createSendgridTransport, MailTransport } from './common';
import {
  createUsersConsumer,
  createUsersService,
  UsersConsumer,
  UsersService,
} from './users';

interface Container {
  usersConsumer: UsersConsumer;
  usersService: UsersService;
  brokerClient: BrokerClient;
  mailTransport: MailTransport;
  configManager: ConfigManager;
}

export async function configureContainer(): Promise<
  AwilixContainer<Container>
> {
  const dotenvManager = createDotenvManager();

  let kafkaClient: BrokerClient = {} as BrokerClient;
  const brokerUrls = dotenvManager.get('BROKER_URLS');
  const kafkaUser = dotenvManager.get('KAFKA_USER');
  const kafkaPass = dotenvManager.get('KAFKA_PASS');

  if (brokerUrls) {
    if (dotenvManager.get('NODE_ENV') === 'production') {
      if (!kafkaUser || !kafkaPass) {
        process.exit(1);
      }

      kafkaClient = await createKafkaClient({
        kafkaConfig: {
          brokers: brokerUrls.split(','),
          ssl: true,
          sasl: {
            mechanism: 'plain',
            username: kafkaUser,
            password: kafkaPass,
          },
        },
        consumerConfig: {
          groupId: 'contact-consumer-group',
        },
      });
    } else {
      kafkaClient = await createKafkaClient({
        kafkaConfig: {
          brokers: brokerUrls.split(','),
        },
        consumerConfig: {
          groupId: 'contact-consumer-group',
        },
      });
    }
  }

  const emailAddress = dotenvManager.get('EMAIL_ADDRESS');
  const mailApiKey = dotenvManager.get('MAIL_API_KEY');
  if (!emailAddress || !mailApiKey) {
    process.exit(1);
  }

  const sendgridTransport = createSendgridTransport({
    name: dotenvManager.get('EMAIL_NAME'),
    email: emailAddress,
    apiKey: mailApiKey,
  });

  const container = createContainer<Container>();

  container.register({
    usersConsumer: asFunction(createUsersConsumer).singleton(),
    usersService: asFunction(createUsersService).singleton(),
    brokerClient: asValue(kafkaClient),
    mailTransport: asValue(sendgridTransport),
    configManager: asValue(dotenvManager),
  });

  return container;
}
