import { Party } from './Party';
import { Topic } from './Topic';
import { User } from './User';

export interface PartyDetails extends Party {
  topics: Topic[];
  admin: User;
  members: User[];
}
