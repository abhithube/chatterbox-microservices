import { KafkaService } from '@chttrbx/common';
import { UserDto, UsersConsumer } from './users';

export interface App {
  init(): Promise<void>;
}

interface AppDeps {
  usersConsumer: UsersConsumer;
  kafkaService: KafkaService;
}

export function createApp({ usersConsumer, kafkaService }: AppDeps) {
  async function init() {
    await kafkaService.subscribe<UserDto>(
      'users',
      usersConsumer.messageHandler
    );
  }

  return {
    init,
  };
}
