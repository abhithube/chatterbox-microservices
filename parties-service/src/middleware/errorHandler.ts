import { NextFunction, Request, Response } from 'express';
import HttpError from '../util/HttpError';

const errorHandler = (
  err: HttpError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const { status, message } = err;

  if (status) res.status(status).json({ message });
  else res.status(500).json({ message });
};

export default errorHandler;
