import { AuthUser } from '@chttrbx/jwt';
import { TopicDto } from './topic.dto';

export class PartyDto {
  id: string;
  name: string;
  inviteToken: string;
  users: AuthUser[];
  topics: TopicDto[];
}
