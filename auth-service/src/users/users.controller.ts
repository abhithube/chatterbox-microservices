import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @EventPattern('USER_CREATED')
  async userCreatedHandler(
    @Payload() data: CreateUserDto,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    await this.usersService.saveUser(data);

    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    channel.ack(originalMsg);
  }

  @EventPattern('USER_DELETED')
  async userDeletedHandler(
    @Payload() data: CreateUserDto,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    await this.usersService.removeUser(data.id);

    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    channel.ack(originalMsg);
  }
}
