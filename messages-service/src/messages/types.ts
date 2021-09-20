import { User } from '../users';
import { Message } from './models';

export type MessageWithUser = Omit<Message, 'userId'> & {
  user: User;
};
