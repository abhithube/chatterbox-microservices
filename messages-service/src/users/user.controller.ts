import { KafkaService, SubscribeTo } from '@chttrbx/kafka';
import { Controller, OnModuleInit } from '@nestjs/common';
import { UserCreatedEvent } from './events';
import { UserService } from './user.service';

@Controller()
export class UserController implements OnModuleInit {
  constructor(private userService: UserService, private kafka: KafkaService) {}

  onModuleInit(): void {
    this.kafka.bindConsumer<UserController>('users', this);
  }

  @SubscribeTo({
    topic: 'users',
    event: 'user:created',
  })
  async userCreatedHandler(user: UserCreatedEvent): Promise<void> {
    this.userService.createUser(user);
  }

  @SubscribeTo({
    topic: 'users',
    event: 'user:deleted',
  })
  async userDeletedHandler(user: UserCreatedEvent): Promise<void> {
    this.userService.deleteUser(user);
  }
}
