import { JwtService } from '@chttrbx/jwt';
import { Inject } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Cache } from 'cache-manager';
import { Server, Socket } from 'socket.io';
import { PartyConnectionDto, TopicConnectionDto } from './dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { SocketWithUser } from './interfaces/socket-with-user.interface';
import { MessageService } from './message.service';

@WebSocketGateway()
export class MessageGateway implements OnGatewayConnection {
  @WebSocketServer()
  private server: Server;

  constructor(
    private messageService: MessageService,
    private jwtService: JwtService,
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
  ) {}

  async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
    const auth = client.handshake.headers.authorization;
    if (!auth) client.disconnect(true);

    try {
      const user = this.jwtService.verify(auth.split(' ')[1]);

      (client as SocketWithUser).user = user;
    } catch (err) {
      client.disconnect(true);
    }
  }

  @SubscribeMessage('join_party')
  async joinPartyHandler(
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() { party }: PartyConnectionDto,
  ): Promise<void> {
    await this.messageService.validatePartyConnection(party, client.user.id);

    client.join(`party:${party}`);
    client.party = party;

    await this.cacheManager.set(`client:${client.id}`, client.user.id, {
      ttl: 60 * 60 * 24 * 1,
    });

    const connectedUsers = await this.getConnectedUsers(client);
    this.server
      .in(`party:${client.party}`)
      .emit('connected_users', connectedUsers);
  }

  @SubscribeMessage('leave_party')
  async leavePartyHandler(
    @ConnectedSocket() client: SocketWithUser,
  ): Promise<void> {
    if (!client.party) return;

    client.party = undefined;
    client.leave(`party:${client.party}`);
    await this.cacheManager.del(`client:${client.id}`);

    const connectedUsers = await this.getConnectedUsers(client);
    client.in(`party:${client.party}`).emit('connected_users', connectedUsers);
  }

  @SubscribeMessage('join_topic')
  async joinTopicHandler(
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() { topic }: TopicConnectionDto,
  ): Promise<void> {
    await this.messageService.validateTopicConnection(topic);

    client.join(`topic:${topic}`);
    client.topic = topic;
  }

  @SubscribeMessage('leave_topic')
  async leaveTopicHandler(
    @ConnectedSocket() client: SocketWithUser,
  ): Promise<void> {
    if (!client.topic) return;

    client.topic = undefined;
    client.leave(`topic:${client.topic}`);
  }

  @SubscribeMessage('send_message')
  async sendMessageHandler(
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() createMessageDto: CreateMessageDto,
  ): Promise<void> {
    if (!client.topic) return;

    const message = await this.messageService.createMessage(
      createMessageDto,
      client.topic,
      client.user,
    );

    this.server.in(`topic:${client.topic}`).emit('receive_message', message);
  }

  async getConnectedUsers(client: SocketWithUser): Promise<string[]> {
    const clients = await client.in(`party:${client.party}`).allSockets();

    const userPromises = [...clients.keys()].map(async (clientId) => {
      const user = await this.cacheManager.get<string>(`client:${clientId}`);
      if (!user) this.server.in(clientId).disconnectSockets();

      return user;
    });

    const connectedSet: Set<string> = new Set();
    for await (const user of userPromises) {
      connectedSet.add(user);
    }

    return [...connectedSet.keys()];
  }
}
