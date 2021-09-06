import { ErrorRequestHandler } from 'express';
import { ValidationError } from 'joi';
import { HttpException } from '../exceptions';

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  let statusCode: number;
  let message: string;

  if (err instanceof HttpException) {
    statusCode = err.status;
    message = err.message;
  } else if (err instanceof ValidationError) {
    statusCode = 400;
    message = err.details[0].message;
  } else {
    console.log(err);

    statusCode = 500;
    message = 'Internal server error';
  }

  res.status(statusCode).json({
    message,
  });
};
