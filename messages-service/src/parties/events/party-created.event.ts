import { PartyDto } from '../dto/party.dto';
import { TopicDto } from '../dto/topic.dto';

export class PartyCreatedEvent {
  type: 'PARTY_CREATED';
  data: {
    party: PartyDto;
    topic: TopicDto;
    userId: string;
  };
}
