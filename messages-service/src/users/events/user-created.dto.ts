import { CreateUserDto } from '../dto/create-user.dto';

export class UserCreatedEvent {
  value: {
    type: 'USER_CREATED';
    data: CreateUserDto;
  };
}
