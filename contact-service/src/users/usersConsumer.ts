import { KafkaMessage, MessageHandler } from '@chttrbx/common';
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
  async function messageHandler({ event, data }: KafkaMessage<UserDto>) {
    switch (event) {
      case 'user:created':
        usersService.sendEmailVerificationLink(data);
        break;
      case 'user:forgot_password':
        usersService.sendPasswordResetLink(data);
        break;
      default:
        break;
    }
  }

  return {
    messageHandler,
  };
}
