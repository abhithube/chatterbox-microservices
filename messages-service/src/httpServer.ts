import { Application } from 'express';
import { createServer, Server } from 'http';

interface HttpServerDeps {
  app: Application;
}

export function createHttpServer({ app }: HttpServerDeps): Server {
  return createServer(app);
}
