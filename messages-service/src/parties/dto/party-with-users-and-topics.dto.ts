import { UserDto } from '../../users/dto/user.dto';
import { PartyDto } from './party.dto';
import { TopicDto } from './topic.dto';

export class PartyWithUsersAndTopicsDto extends PartyDto {
  inviteToken: string;
  users: UserDto[];
  topics: TopicDto[];
}
