import { TokenIssuer } from '@chttrbx/common';
import { createAdapter } from '@socket.io/redis-adapter';
import { Server as HttpServer } from 'http';
import Redis from 'ioredis';
import { Server } from 'socket.io';

interface SocketServerDeps {
  server: HttpServer;
  tokenIssuer: TokenIssuer;
}

export function createSocketServer({
  server,
  tokenIssuer,
}: SocketServerDeps): Server {
  const redisClient = new Redis(process.env.REDIS_URL);
  const io = new Server(server, {
    adapter: createAdapter(redisClient, redisClient.duplicate()),
    cors: {
      origin: process.env.CLIENT_URL,
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
