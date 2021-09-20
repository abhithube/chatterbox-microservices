import { User } from '../users';
import { Party, Topic } from './entities';

export type PartyWithMembersAndTopics = Party & {
  members: User[];
  topics: Topic[];
};
