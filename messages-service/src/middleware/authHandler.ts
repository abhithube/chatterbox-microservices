import { NextFunction, Response } from 'express';
import { RequestWithAuth, SocketWithAuth } from '../types';
import HttpError from '../util/HttpError';
import tokenUtil from '../util/tokenUtil';

export const apiAuthHandler = (
  req: RequestWithAuth,
  _: Response,
  next: NextFunction
): void => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer '))
    throw new HttpError(401, 'User not authenticated');

  const token = auth.split(' ')[1];
  try {
    req.payload = tokenUtil.verifyToken(token);
    next();
  } catch (err) {
    throw new HttpError(403, 'User not authorized');
  }
};

export const socketsAuthHandler = (
  socket: SocketWithAuth,
  next: (err?: Error) => void
): void => {
  const auth = socket.handshake.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    next(new Error('User not authenticated'));
    return;
  }

  const token = auth.split(' ')[1];
  try {
    // eslint-disable-next-line no-param-reassign
    socket.payload = tokenUtil.verifyToken(token);
    next();
  } catch (err) {
    next(new Error('User not authorized'));
  }
};
