import {
  errorMiddleware,
  jwtAuthMiddleware,
  TokenIssuer,
} from '@chttrbx/common';
import cors from 'cors';
import express, { Router } from 'express';

interface AppDeps {
  partiesRouter: Router;
  tokenIssuer: TokenIssuer;
}

export function createApp({ partiesRouter, tokenIssuer }: AppDeps) {
  const app = express();

  app.use(express.json());

  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    })
  );

  app.use('/parties', jwtAuthMiddleware({ tokenIssuer }), partiesRouter);

  app.use(errorMiddleware);

  return app;
}
