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
import { CreateMessageDto } from './dto/create-message.dto';
import { PartyConnectionDto } from './dto/party-connection.dto';
import { TopicConnectionDto } from './dto/topic-connection.dto';
import { SocketWithUser } from './interfaces/socket-with-user.interface';
import { MessagesService } from './messages.service';

@WebSocketGateway()
export class MessagesGateway implements OnGatewayConnection {
  @WebSocketServer()
  private server: Server;

  constructor(
    private messagesService: MessagesService,
    private jwtService: JwtService,
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
  ) {}

  async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
    const auth = client.handshake.headers.authorization;
    if (!auth) client.disconnect(true);

    try {
      const { id } = this.jwtService.verify(auth.split(' ')[1]);

      (client as SocketWithUser).user = id;
    } catch (err) {
      client.disconnect(true);
    }
  }

  @SubscribeMessage('join_party')
  async joinPartyHandler(
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() { party }: PartyConnectionDto,
  ): Promise<void> {
    await this.messagesService.validatePartyConnection(party, client.user);

    client.join(`party:${party}`);
    client.party = party;

    await this.cacheManager.set(`client:${client.id}`, client.user, {
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
    await this.messagesService.validateTopicConnection(topic, client.user);

    client.join(`topic:${topic}`);
    client.topic = topic;
  }

  @SubscribeMessage('leave_topic')
  async leaveTopicHandler(
    @ConnectedSocket() client: SocketWithUser,
  ): Promise<void> {
    if (!client.topic) return;

    client.leave(`topic:${client.topic}`);
  }

  @SubscribeMessage('send_message')
  async sendMessageHandler(
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() createMessageDto: CreateMessageDto,
  ): Promise<void> {
    if (!client.topic) return;

    const message = await this.messagesService.createMessage(
      createMessageDto,
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
