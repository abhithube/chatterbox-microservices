import { PartyDto, TopicDto } from './dto';

export type PartyCreatedEvent = PartyDto;

export type PartyDeletedEvent = Pick<PartyDto, 'id'>;

export type PartyJoinedEvent = {
  partyId: string;
  userId: string;
};

export type PartyLeftEvent = PartyJoinedEvent;

export type TopicCreatedEvent = TopicDto & {
  partyId: string;
};

export type TopicDeletedEvent = Pick<TopicDto, 'id'> & {
  partyId: string;
};
