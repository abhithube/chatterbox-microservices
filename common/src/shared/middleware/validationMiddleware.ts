import { NextFunction, Request, Response } from 'express';
import { Schema } from 'joi';
import { ValidationProperties } from '../interfaces';

export const validationMiddleware =
  (property: ValidationProperties, schema: Schema) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.validateAsync(req[property]);
      next();
    } catch (err) {
      next(err);
    }
  };
