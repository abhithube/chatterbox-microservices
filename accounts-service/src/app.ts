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

  const clientUrl = configManager.get('CLIENT_URL');
  if (clientUrl) {
    app.use(
      cors({
        credentials: true,
        origin: clientUrl,
      })
    );
  } else {
    app.use(cors());
  }

  app.use('/accounts', accountsRouter);
  app.use('/auth', authRouter);

  app.use(errorMiddleware);

  return app;
}
