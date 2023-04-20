import { Socket } from 'socket.io';

export class SocketWithUser extends Socket {
  user: string;
  party?: string;
  topic?: string;
}
