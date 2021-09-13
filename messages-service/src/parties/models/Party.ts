import { Topic } from './Topic';

export interface Party {
  id: string;
  name: string;
  inviteToken: string;
  members: string[];
  topics: Topic[];
}
