import { CurrentUser } from '@chttrbx/common';
import { Socket } from 'socket.io';

export interface SocketWithUser extends Socket {
  user: CurrentUser;
  party?: string;
  topic?: string;
}
