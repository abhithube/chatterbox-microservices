import { PartyDto } from './party.dto';
import { TopicDto } from './topic.dto';

export class PartyCreatedDto {
  party: PartyDto;
  topic: TopicDto;
  userId: string;
}
