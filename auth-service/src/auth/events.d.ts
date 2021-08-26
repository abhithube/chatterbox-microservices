import { UserDto } from './dto';
import { User } from './user.entity';

export type UserCreatedEvent = UserDto &
  Pick<User, 'verificationToken' | 'resetToken'>;

export type UserUpdatedEvent = UserCreatedEvent;

export type UserDeletedEvent = Pick<UserDto, 'id'>;
