import { configureContainer } from './container';

configureContainer().then(async (container) => {
  const app = container.resolve('app');

  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Listening on port ${port}...`));
});
