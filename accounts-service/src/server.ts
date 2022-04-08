import { configureContainer } from './container';

configureContainer().then(async (container) => {
  const configManager = container.resolve('configManager');

  if (
    !configManager.get('GOOGLE_CLIENT_ID') ||
    !configManager.get('GOOGLE_CLIENT_SECRET') ||
    !configManager.get('GITHUB_CLIENT_ID') ||
    !configManager.get('GITHUB_CLIENT_SECRET') ||
    !configManager.get('CLIENT_URL') ||
    !configManager.get('GOOGLE_OAUTH_CALLBACK_URL')
  ) {
    throw new Error('Configuration missing');
  }

  const app = container.resolve('app');

  const port = configManager.get('PORT') || 5001;
  app.listen(port, () => console.log(`Listening on port ${port}...`));
});
