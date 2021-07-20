import { Socket } from 'socket.io';

export interface SocketWithUser extends Socket {
  user: string;
  party?: string;
  topic?: string;
}
