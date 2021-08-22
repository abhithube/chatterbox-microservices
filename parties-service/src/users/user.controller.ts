import { KafkaService, SubscribeTo } from '@chttrbx/kafka';
import { Controller, OnModuleInit } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { UserService } from './user.service';

@Controller()
export class UserController implements OnModuleInit {
  constructor(private userService: UserService, private kafka: KafkaService) {}

  onModuleInit(): void {
    this.kafka.bindConsumer<UserController>('users', this);
  }

  @SubscribeTo({
    topic: 'users',
    event: 'USER_CREATED',
  })
  async userCreatedHandler(createUserDto: CreateUserDto): Promise<void> {
    this.userService.createUser(createUserDto);
  }

  @SubscribeTo({
    topic: 'users',
    event: 'USER_DELETED',
  })
  async userDeletedHandler({ id }: DeleteUserDto): Promise<void> {
    return this.userService.deleteUser(id);
  }
}
