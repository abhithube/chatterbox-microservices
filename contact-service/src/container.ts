import { createKafkaService, KafkaService } from '@chttrbx/common';
import { asFunction, createContainer } from 'awilix';
import { App, createApp } from './app';
import { createSendgridTransport, MailTransport } from './common';
import {
  createUsersConsumer,
  createUsersService,
  UsersConsumer,
  UsersService,
} from './users';

interface ContainerDeps {
  app: App;
  usersConsumer: UsersConsumer;
  usersService: UsersService;
  mailTransport: MailTransport;
  kafkaService: KafkaService;
}

const container = createContainer<ContainerDeps>();

container.register({
  app: asFunction(createApp).singleton(),
  usersConsumer: asFunction(createUsersConsumer).singleton(),
  usersService: asFunction(createUsersService).singleton(),
  mailTransport: asFunction(() =>
    createSendgridTransport({
      name: process.env.EMAIL_NAME,
      email: process.env.EMAIL_ADDRESS!,
      apiKey: process.env.SENDGRID_API_KEY!,
    })
  ).singleton(),
  kafkaService: asFunction(() =>
    createKafkaService({
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
    })
  ).singleton(),
});

export { container };
