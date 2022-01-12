import { ConfigManager, errorMiddleware } from '@chttrbx/common';
import cors from 'cors';
import express, { Application, Router } from 'express';

interface AppDeps {
  accountsRouter: Router;
  authRouter: Router;
  configManager: ConfigManager;
}

export function createApp({
  accountsRouter,
  authRouter,
  configManager,
}: AppDeps): Application {
  const app = express();

  app.use(express.json());

  app.use(
    cors({
      credentials: true,
      origin: configManager.get('CLIENT_URL'),
    })
  );

  app.use('/accounts-service/accounts', accountsRouter);
  app.use('/accounts-service/auth', authRouter);

  app.get('/accounts-service/health', (_, res) => res.send('OK'));

  app.use(errorMiddleware);

  return app;
}
