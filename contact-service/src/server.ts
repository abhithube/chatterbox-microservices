import { container } from './container';

container.cradle.app.init().then(() => {
  console.log('Started server...');
});
