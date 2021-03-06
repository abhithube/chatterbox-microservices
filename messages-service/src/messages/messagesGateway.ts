import { TokenIssuer } from '@chttrbx/common';
import Redis from 'ioredis';
import { Server, Socket } from 'socket.io';
import { CreateMessageDto, CreateMessageSchema } from './dto';
import { SocketWithUser } from './interfaces';
import { MessagesService } from './messagesService';

interface PartyConnection {
  party: string;
}

interface TopicConnection {
  topic: string;
}

export interface MessagesGateway {
  socketHandler(io: Server, socket: Socket): void;
}

interface MessagesGatewayDeps {
  messagesService: MessagesService;
  tokenIssuer: TokenIssuer;
  redisClient: Redis;
}

export function createMessagesGateway({
  messagesService,
  tokenIssuer,
  redisClient,
}: MessagesGatewayDeps): MessagesGateway {
  function socketHandler(io: Server, socket: Socket) {
    const client = socket as SocketWithUser;

    const auth = client.handshake.headers.authorization;

    if (!auth) {
      client.disconnect(true);
      return;
    }

    try {
      const user = tokenIssuer.validate(auth.split(' ')[1]);

      client.user = user;
    } catch (err) {
      client.disconnect(true);
    }

    socket.on(
      'party:connect',
      async ({ party }: PartyConnection, callback: () => void) => {
        if (client.party) {
          client.leave(`party:${client.party}`);
          await redisClient.del(`client:${client.id}`);
        }

        client.join(`party:${party}`);
        client.party = party;

        await redisClient.set(
          `client:${client.id}`,
          client.user.id,
          'EX',
          60 * 60 * 24 * 1
        );

        const clients = await client.in(`party:${client.party}`).allSockets();

        const userPromises = [...clients.keys()].map(async (clientId) => {
          const userId = await redisClient.get(`client:${clientId}`);

          return { clientId, userId };
        });

        const users = await Promise.all(userPromises);

        const connectedSet = new Set<string>();

        users.forEach(({ clientId, userId }) => {
          if (!userId) {
            io.in(clientId).disconnectSockets();
          } else {
            connectedSet.add(userId);
          }
        });

        const connectedUsers = [...connectedSet.keys()];

        io.in(`party:${client.party}`).emit('users:read', connectedUsers);

        callback();
      }
    );

    socket.on(
      'topic:connect',
      async ({ topic }: TopicConnection, callback: () => void) => {
        if (client.topic) {
          client.leave(`topic:${client.topic}`);
        }

        client.join(`topic:${topic}`);
        client.topic = topic;

        callback();
      }
    );

    socket.on(
      'message:create',
      async (createMessageDto: CreateMessageDto, callback: () => void) => {
        if (!client.topic) {
          return;
        }

        await CreateMessageSchema.validateAsync(createMessageDto);

        const message = await messagesService.createMessage(
          createMessageDto,
          client.topic,
          client.user
        );

        io.in(`topic:${client.topic}`).emit('message:read', message);

        callback();
      }
    );
  }

  return {
    socketHandler,
  };
}
