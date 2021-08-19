import { UserDto } from '../../users/dto/user.dto';
import { TopicDto } from './topic.dto';

export class PartyDto {
  id: string;
  name: string;
  inviteToken: string;
  users: UserDto[];
  topics: TopicDto[];
}
