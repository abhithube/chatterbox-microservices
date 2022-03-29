import { Message, MessageHandler } from '@chttrbx/common';
import { UserDto } from './interfaces';
import { UsersService } from './usersService';

export interface UsersConsumer {
  messageHandler: MessageHandler<UserDto>;
}

interface UsersConsumerDeps {
  usersService: UsersService;
}

export function createUsersConsumer({
  usersService,
}: UsersConsumerDeps): UsersConsumer {
  async function messageHandler({ event, data }: Message<UserDto>) {
    switch (event) {
      case 'user:created':
        usersService.createUser(data);
        break;
      default:
        break;
    }
  }

  return {
    messageHandler,
  };
}
