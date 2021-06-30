import { NextFunction, Response } from 'express';
import { RequestWithAuth } from '../types';
import HttpError from '../util/HttpError';
import tokenUtil from '../util/tokenUtil';

const authHandler = (
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

export default authHandler;
