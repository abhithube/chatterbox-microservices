import { AuthUser } from '@chttrbx/jwt';
import { Socket } from 'socket.io';

export interface SocketWithUser extends Socket {
  user: AuthUser;
  party?: string;
  topic?: string;
}
