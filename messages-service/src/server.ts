import { configureContainer } from './container';

configureContainer().then(async (container) => {
  const server = container.resolve('server');

  const port = process.env.PORT || 5000;
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