import { AuthUser } from '@chttrbx/jwt';

export class MessageDto {
  id: string;
  topicIndex: number;
  body: string;
  user: AuthUser;
  createdAt: Date;
}
