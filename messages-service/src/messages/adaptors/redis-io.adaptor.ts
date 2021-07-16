import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as Redis from 'ioredis';
import { createAdapter } from 'socket.io-redis';

export class RedisIoAdapter extends IoAdapter {
  private redisAdapter: any;

  constructor(app: INestApplication, private configService: ConfigService) {
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

  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.redisAdapter);
    return server;
  }
}
