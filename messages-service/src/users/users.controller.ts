import { Controller } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { EventPattern } from '@nestjs/microservices';
import { CreateUserDto } from './dto';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(
    private usersService: UsersService,
    private eventEmitter: EventEmitter2,
  ) {}

  @EventPattern('users')
  handleUserEvents(payload: Record<string, unknown>) {
    this.eventEmitter.emit(payload.event as string, payload.data);
  }

  @OnEvent('user:created')
  handleUserCreated(createUserDto: CreateUserDto) {
    this.usersService.createUser(createUserDto);
  }
}
