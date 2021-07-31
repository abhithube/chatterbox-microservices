import { JwtService } from '@chttrbx/jwt';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as Redis from 'ioredis';
import { parseUrl } from 'query-string';
import { ServerOptions } from 'socket.io';
import { createAdapter } from 'socket.io-redis';

export class RedisIoAdapter extends IoAdapter {
  private redisAdapter: any;

  constructor(
    app: INestApplication,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {
    super(app);

    const pubClient = new Redis({
      host: configService.get('REDIS_HOST'),
      port: configService.get('REDIS_PORT'),
      password: configService.get('REDIS_PASSWORD'),
      tls: {},
    });
    const subClient = pubClient.duplicate();
    this.redisAdapter = createAdapter({ pubClient, subClient });
  }

  createIOServer(port: number, options?: ServerOptions): any {
    options.cors = {
      credentials: true,
      origin: this.configService.get('CLIENT_URL'),
    };

    options.allowRequest = (req, fn) => {
      const auth =
        req.headers.authorization?.split(' ')[1] ||
        (parseUrl(req.url).query.token as string);

      if (!auth) return fn('User not authenticated', false);

      try {
        this.jwtService.verify(auth);

        return fn(null, true);
      } catch (err) {
        return fn('User not authorized', false);
      }
    };

    const server = super.createIOServer(port, options);
    server.adapter(this.redisAdapter);
    return server;
  }
}
