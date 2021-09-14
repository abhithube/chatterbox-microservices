import {
  ConfigManager,
  errorMiddleware,
  jwtAuthMiddleware,
  TokenIssuer,
} from '@chttrbx/common';
import cors from 'cors';
import express, { Router } from 'express';

interface AppDeps {
  partiesRouter: Router;
  tokenIssuer: TokenIssuer;
  configManager: ConfigManager;
}

export function createApp({
  partiesRouter,
  tokenIssuer,
  configManager,
}: AppDeps) {
  const app = express();

  app.use(express.json());

  const clientUrl = configManager.get('CLIENT_URL');
  if (!clientUrl) {
    app.use(
      cors({
        origin: clientUrl,
        credentials: true,
      })
    );
  } else {
    app.use(cors());
  }

  app.use('/parties', jwtAuthMiddleware({ tokenIssuer }), partiesRouter);

  app.use(errorMiddleware);

  return app;
}
