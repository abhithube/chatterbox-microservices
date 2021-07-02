import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Socket } from 'socket.io';

export type RequestWithAuth = Request & {
  payload?: JwtPayload;
};

export type SocketWithAuth = Socket & {
  payload?: JwtPayload;
};
