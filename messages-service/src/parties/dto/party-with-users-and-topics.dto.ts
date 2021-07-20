import { UserDto } from '../../users/dto/user.dto';
import { TopicDto } from './topic.dto';

export class PartyWithUsersAndTopicsDto {
  id: string;
  name: string;
  users: UserDto[];
  topics: TopicDto[];
  createdAt: Date;
  updatedAt: Date;
}
