import { configureContainer } from './container';

configureContainer().then(async (container) => {
  const brokerClient = container.resolve('brokerClient');
  const usersConsumer = container.resolve('usersConsumer');

  await brokerClient.subscribe('users', usersConsumer.messageHandler);

  console.log('Started server...');
});
