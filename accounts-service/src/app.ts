import { errorMiddleware } from '@chttrbx/common';
import cors from 'cors';
import express, { Router } from 'express';

interface AppDeps {
  accountsRouter: Router;
  authRouter: Router;
}

export function createApp({ accountsRouter, authRouter }: AppDeps) {
  const app = express();

  app.use(
    cors({
      credentials: true,
      origin: process.env.CLIENT_URL!,
    })
  );
  app.use(express.json());

  app.use('/accounts', accountsRouter);
  app.use('/auth', authRouter);

  app.use(errorMiddleware);

  return app;
}
