import { Socket } from 'socket.io';
import { AuthUser } from './auth-user.interface';

export interface SocketWithUser extends Socket {
  user: AuthUser;
  party?: number;
}
