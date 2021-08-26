import { Party, Topic } from './party.entity';

export type PartyDto = Pick<
  Party,
  'id' | 'name' | 'inviteToken' | 'users' | 'topics'
>;

export type TopicDto = Pick<Topic, 'id' | 'name'>;
