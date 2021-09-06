import { errorMiddleware } from '@chttrbx/common';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Router } from 'express';
import mongoose from 'mongoose';

export interface App {
  init(): Promise<Application>;
}

interface AppDeps {
  accountsRouter: Router;
  authRouter: Router;
}

export function createApp({ accountsRouter, authRouter }: AppDeps) {
  async function init(): Promise<Application> {
    await mongoose.connect(process.env.DATABASE_URL!);

    const app = express();

    app.use(
      cors({
        credentials: true,
        origin: process.env.CLIENT_URL!,
      })
    );
    app.use(express.json());
    app.use(cookieParser());

    app.use('/accounts', accountsRouter);
    app.use('/auth', authRouter);

    app.use(errorMiddleware);

    return app;
  }

  return {
    init,
  };
}
