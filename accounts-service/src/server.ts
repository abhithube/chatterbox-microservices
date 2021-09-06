import { container } from './container';

container.cradle.app.init().then((app) => {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Listening on port ${port}...`));
});
