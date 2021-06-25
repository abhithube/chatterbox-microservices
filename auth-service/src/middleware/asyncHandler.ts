import { NextFunction, Request, RequestHandler, Response } from 'express';

const asyncHandler =
  (handler: RequestHandler) =>
  (req: Request, res: Response, next: NextFunction): Promise<void> =>
    Promise.resolve(handler(req, res, next)).catch(err => next(err));

export default asyncHandler;
