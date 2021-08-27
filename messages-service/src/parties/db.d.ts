import { Party, Topic } from './party.entity';

export type PartyDocument = Omit<Party, '_id'>;

export type TopicDocument = Topic;

export type PartyFilterOptions = Partial<
  Pick<Party, '_id' | 'id' | 'name' | 'inviteToken'> & {
    userId: string;
    topicId: string;
  }
>;
