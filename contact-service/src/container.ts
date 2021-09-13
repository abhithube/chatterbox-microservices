import { BrokerClient, createKafkaClient } from '@chttrbx/common';
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
}

export async function configureContainer() {
  const kafkaBroker = await createKafkaClient({
    kafkaConfig: {
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
      groupId: 'contact-consumer-group',
    },
  });

  const container = createContainer<ContainerDeps>();

  container.register({
    usersConsumer: asFunction(createUsersConsumer).singleton(),
    usersService: asFunction(createUsersService).singleton(),
    mailTransport: asFunction(() =>
      createSendgridTransport({
        name: process.env.EMAIL_NAME,
        email: process.env.EMAIL_ADDRESS!,
        apiKey: process.env.SENDGRID_API_KEY!,
      })
    ).singleton(),
    brokerClient: asValue(kafkaBroker),
  });

  return container;
}
