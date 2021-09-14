import { configureContainer } from './container';

configureContainer().then(async (container) => {
  const server = container.resolve('httpServer');

  const configManager = container.resolve('configManager');

  if (!configManager.get('CLIENT_URL')) {
    throw new Error('Configuration missing');
  }

  const port = configManager.get('PORT') || 5000;
  server.listen(port, () => console.log(`Listening on port ${port}...`));

  const io = container.resolve('socketServer');
  const messagesGateway = container.resolve('messagesGateway');

  io.on('connection', (socket) => {
    messagesGateway.socketHandler(io, socket);
  });

  const brokerClient = container.resolve('brokerClient');
  const usersConsumer = container.resolve('usersConsumer');

  await brokerClient.subscribe('users', usersConsumer.messageHandler);
});
