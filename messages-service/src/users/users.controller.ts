import { KafkaService, SubscribeTo } from '@chttrbx/kafka';
import { Controller, OnModuleInit } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@Controller()
export class UsersController implements OnModuleInit {
  constructor(
    private usersService: UsersService,
    private kafka: KafkaService,
  ) {}

  onModuleInit(): void {
    this.kafka.bindConsumer<UsersController>('profiles', this);
  }

  @SubscribeTo({
    topic: 'profiles',
    event: 'USER_CREATED',
  })
  async userCreatedHandler(createUserDto: CreateUserDto): Promise<void> {
    return this.usersService.saveUser(createUserDto);
  }

  @SubscribeTo({
    topic: 'profiles',
    event: 'USER_DELETED',
  })
  async userDeletedHandler({ id }: Pick<UserDto, 'id'>): Promise<void> {
    return this.usersService.removeUser(id);
  }
}
