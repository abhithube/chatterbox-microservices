import { JwtPayloadDto } from '@lib/auth';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketWithUser } from '../common';
import { CreateMessageDto } from './dto';
import { MessagesService } from './messages.service';

@WebSocketGateway()
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private messagesService: MessagesService,
  ) {}

  handleConnection(client: Socket) {
    const token = client.handshake.headers.authorization.split(' ')[1];

    try {
      const decoded = this.jwtService.verify(token) as JwtPayloadDto;
      (client as SocketWithUser).user = decoded.sub;
    } catch (error) {
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: SocketWithUser) {
    if (client.party) {
      const room = `party:${client.party}`;

      const sockets = await this.server.in(room).fetchSockets();
      const users = sockets.map(
        (socket) => (socket as any as SocketWithUser).user,
      );

      this.server.in(room).emit('user:online', users);
    }
  }

  @SubscribeMessage('party:join')
  async handleJoinParty(
    @MessageBody() partyId: string,
    @ConnectedSocket() client: SocketWithUser,
  ) {
    if (client.party) {
      const oldParty = `party:${client.party}`;

      client.leave(oldParty);

      const sockets = await this.server.in(oldParty).fetchSockets();
      const users = sockets.map(
        (socket) => (socket as any as SocketWithUser).user,
      );

      this.server.in(oldParty).emit('user:online', users);
    }

    const newParty = `party:${partyId}`;

    await client.join(newParty);
    client.party = partyId;

    const sockets = await this.server.in(newParty).fetchSockets();
    const users = sockets.map(
      (socket) => (socket as any as SocketWithUser).user,
    );

    this.server.in(newParty).emit('user:online', users);
  }

  @SubscribeMessage('topic:join')
  async handleJoinTopic(
    @MessageBody() topicId: string,
    @ConnectedSocket() client: SocketWithUser,
  ) {
    if (client.topic) client.leave(`topic:${client.topic}`);

    await client.join(`topic:${topicId}`);
    client.topic = topicId;
  }

  @SubscribeMessage('message:create')
  async createMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: SocketWithUser,
  ) {
    if (!client.topic) return;

    const message = await this.messagesService.createMessage(
      createMessageDto,
      client.topic,
      client.user,
    );

    this.server.in(`topic:${client.topic}`).emit('message:append', message);
  }
}
