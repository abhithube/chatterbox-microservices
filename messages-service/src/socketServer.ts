import { ConfigManager, TokenIssuer } from '@chttrbx/common';
import { createAdapter } from '@socket.io/redis-adapter';
import { Server as HttpServer } from 'http';
import Redis from 'ioredis';
import { Server } from 'socket.io';

interface SocketServerDeps {
  httpServer: HttpServer;
  tokenIssuer: TokenIssuer;
  configManager: ConfigManager;
  redisClient: Redis;
}

export function createSocketServer({
  httpServer,
  tokenIssuer,
  configManager,
  redisClient,
}: SocketServerDeps): Server {
  const io = new Server(httpServer, {
    path: '/messages-service/socket.io',
    adapter: createAdapter(redisClient, redisClient.duplicate()),
    cors: {
      origin: configManager.get('CLIENT_URL'),
      credentials: true,
    },
    allowRequest: (req, done) => {
      const auth = req.headers.authorization;
      if (!auth) return done('User not authenticated', false);

      try {
        tokenIssuer.validate(auth.split(' ')[1]);

        return done(null, true);
      } catch (err) {
        return done('User not authorized', false);
      }
    },
  });

  return io;
}
