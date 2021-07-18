import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EventDto } from './dto/event.dto';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @EventPattern('users')
  async eventsHandler(@Payload() { value }: EventDto): Promise<void> {
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
