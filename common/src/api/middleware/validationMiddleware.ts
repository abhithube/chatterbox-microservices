import { NextFunction, Request, Response } from 'express';
import { Schema } from 'joi';

export const validationMiddleware =
  (schema: Schema) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.validateAsync(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
