import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { UserCreatedEvent } from './events/user-created.dto';
import { UserDeletedEvent } from './events/user-deleted.event';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @EventPattern('profiles')
  async eventsHandler(
    @Payload() { value }: UserCreatedEvent | UserDeletedEvent,
  ): Promise<void> {
    switch (value.type) {
      case 'USER_CREATED':
        await this.usersService.saveUser(value.data);
        break;
      case 'USER_DELETED':
        await this.usersService.removeUser(value.data.id);
      default:
        break;
    }
  }
}
