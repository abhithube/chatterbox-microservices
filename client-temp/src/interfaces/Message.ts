import { User } from './User';

export interface Message {
  _id: string;
  body: string;
  createdAt: Date;
  user: User;
}
