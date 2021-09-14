import { configureContainer } from './container';

configureContainer().then(async (container) => {
  const configManager = container.resolve('configManager');
  const app = container.resolve('app');

  const port = configManager.get('PORT') || 5000;
  app.listen(port, () => console.log(`Listening on port ${port}...`));
});
