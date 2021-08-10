import { JwtService } from '@chttrbx/jwt';
import { Inject } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Cache } from 'cache-manager';
import { Server, Socket } from 'socket.io';
import { CreateMessageDto } from './dto/create-message.dto';
import { TopicConnectionDto } from './dto/topic-connection.dto';
import { SocketWithUser } from './interfaces/socket-with-user.interface';
import { MessagesService } from './messages.service';

@WebSocketGateway()
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;

  constructor(
    private messagesService: MessagesService,
    private jwtService: JwtService,
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
  ) {}

  async handleConnection(@ConnectedSocket() initClient: Socket): Promise<void> {
    const auth = initClient.handshake.headers.authorization;
    const party = initClient.handshake.query.party as string;

    if (!auth || !party) initClient.disconnect(true);

    try {
      const { id } = this.jwtService.verify(auth.split(' ')[1]);

      const client = initClient as SocketWithUser;
      client.user = id;

      await this.messagesService.validatePartyConnection(party, client.user);

      client.join(`party:${party}`);
      client.party = party;

      await this.cacheManager.set(`client:${client.id}`, client.user, {
        ttl: 60 * 60 * 24 * 1,
      });

      const clients = Array.from(
        await client.in(`party:${party}`).allSockets(),
      );

      const userPromises = clients.map(async (clientId) => {
        const user = await this.cacheManager.get<string>(`client:${clientId}`);
        if (!user) this.server.in(clientId).disconnectSockets();

        return user;
      });

      const connectedSet: Set<string> = new Set();
      for await (const val of userPromises) {
        connectedSet.add(val);
      }

      const connectedUsers = Array.from(connectedSet);
      client
        .in(`party:${client.party}`)
        .emit('connected_users', connectedUsers);
      client.emit('connected_users', connectedUsers);
    } catch (err) {
      initClient.disconnect(true);
    }
  }

  async handleDisconnect(
    @ConnectedSocket() client: SocketWithUser,
  ): Promise<void> {
    if (!client.party) return;

    client.leave(`party:${client.party}`);
    await this.cacheManager.del(`client:${client.id}`);

    const clients = Array.from(
      await client.in(`party:${client.party}`).allSockets(),
    );

    const userPromises = clients.map(async (clientId) => {
      const user = await this.cacheManager.get<string>(`client:${clientId}`);
      if (!user) this.server.in(clientId).disconnectSockets();

      return user;
    });

    const connectedUsers: string[] = [];
    for await (const user of userPromises) {
      connectedUsers.push(user);
    }

    client.in(`party:${client.party}`).emit('connected_users', connectedUsers);
  }

  @SubscribeMessage('join_topic')
  async joinChannelHandler(
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() { topic }: TopicConnectionDto,
  ): Promise<void> {
    await this.messagesService.validateTopicConnection(topic, client.user);

    client.join(`topic:${topic}`);
    client.topic = topic;
  }

  @SubscribeMessage('leave_topic')
  async leaveChannelHandler(
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
}
