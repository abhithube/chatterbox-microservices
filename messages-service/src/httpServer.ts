import { Application } from 'express';
import { createServer } from 'http';

interface HttpServerDeps {
  app: Application;
}

export function createHttpServer({ app }: HttpServerDeps) {
  return createServer(app);
}
