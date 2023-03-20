import { Socket } from 'socket.io';
import { User } from '../../users';

export class SocketWithUser extends Socket {
  user: User;
  party?: string;
  topic?: string;
}
