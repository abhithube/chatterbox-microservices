import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verify } from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { SocketWithUser } from '../interfaces/socket-with-user.interface';

@Injectable()
export class JwtSocketIoGaurd implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();

    const token = client.handshake.headers.authorization.split(' ')[1];

    try {
      const payload = verify(
        token,
        this.configService.get('JWT_SECRET'),
      ) as JwtPayload;

      (client as SocketWithUser).user = {
        id: payload.sub,
        username: payload.username,
        avatarUrl: payload.avatarUrl,
      };

      return true;
    } catch (err) {
      return false;
    }
  }
}
