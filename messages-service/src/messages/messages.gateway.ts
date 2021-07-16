import { Inject, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Cache } from 'cache-manager';
import { Server } from 'socket.io';
import { JwtSocketIoGaurd } from 'src/auth/guards/jwt-socket-io.guard';
import { AuthUser } from 'src/auth/interfaces/auth-user.interface';
import { SocketWithUser } from 'src/auth/interfaces/socket-with-user.interface';
import { CreateMessageDto } from './dto/create-message.dto';
import { PartyConnectionDto } from './dto/party-connection.dto';
import { TopicConnectionDto } from './dto/topic-connection.dto';
import { MessagesService } from './messages.service';

@WebSocketGateway()
export class MessagesGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  constructor(
    private messagesService: MessagesService,
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
  ) {}

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
      const user = await this.cacheManager.get<AuthUser>(`client:${clientId}`);
      if (!user) this.server.in(clientId).disconnectSockets();

      return user;
    });

    const connectedUsers: AuthUser[] = [];
    for await (const user of userPromises) {
      connectedUsers.push(user);
    }

    client.in(`party:${client.party}`).emit('connected_users', connectedUsers);
  }

  @UseGuards(JwtSocketIoGaurd)
  @SubscribeMessage('user_online')
  async userOnlineHandler(
    @MessageBody() partyConnectionDto: PartyConnectionDto,
    @ConnectedSocket() client: SocketWithUser,
  ): Promise<void> {
    const party = await this.messagesService.verifyPartyConnection(
      partyConnectionDto,
      client.user.id,
    );

    if (!client.party) {
      client.join(`party:${party.id}`);
      client.party = party.id;

      await this.cacheManager.set(`client:${client.id}`, client.user, {
        ttl: 60 * 60 * 24 * 1,
      });
    }

    const clients = Array.from(
      await client.in(`party:${party.id}`).allSockets(),
    );

    const userPromises = clients.map(async (clientId) => {
      const user = await this.cacheManager.get<AuthUser>(`client:${clientId}`);
      if (!user) this.server.in(clientId).disconnectSockets();

      return user;
    });

    const connectedUsers: AuthUser[] = [];
    for await (const val of userPromises) {
      connectedUsers.push(val);
    }

    client.in(`party:${party.id}`).emit('connected_users', connectedUsers);
    client.emit('connected_users', connectedUsers);
  }

  @UseGuards(JwtSocketIoGaurd)
  @SubscribeMessage('join_topic')
  async joinChannelHandler(
    @MessageBody() topicConnectionDto: TopicConnectionDto,
    @ConnectedSocket() client: SocketWithUser,
  ): Promise<void> {
    const topic = await this.messagesService.verifyTopicConnection(
      topicConnectionDto,
      client.user.id,
    );

    client.join(`topic:${topic.id}`);
  }

  @UseGuards(JwtSocketIoGaurd)
  @SubscribeMessage('leave_topic')
  async leaveChannelHandler(
    @MessageBody() topicConnectionDto: TopicConnectionDto,
    @ConnectedSocket() client: SocketWithUser,
  ): Promise<void> {
    const topic = await this.messagesService.verifyTopicConnection(
      topicConnectionDto,
      client.user.id,
    );

    client.leave(`topic:${topic.id}`);
  }

  @UseGuards(JwtSocketIoGaurd)
  @SubscribeMessage('send_message')
  async sendMessageHandler(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: SocketWithUser,
  ): Promise<void> {
    const message = await this.messagesService.createMessage(
      createMessageDto,
      client.user.id,
    );

    this.server
      .in(`topic:${createMessageDto.topicId}`)
      .emit('receive_message', message);
  }
}
