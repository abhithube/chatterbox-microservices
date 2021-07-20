import { EventUserDto } from './event-user.dto';

export class EventDto {
  value: {
    type: 'USER_CREATED' | 'USER_DELETED';
    data: EventUserDto;
  };
}
