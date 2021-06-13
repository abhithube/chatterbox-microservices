import { NextFunction, Request, RequestHandler, Response } from 'express';

export const asyncHandler =
  (handler: RequestHandler) =>
  (req: Request, res: Response, next: NextFunction): Promise<void> =>
    Promise.resolve(handler(req, res, next)).catch(err => next(err));
