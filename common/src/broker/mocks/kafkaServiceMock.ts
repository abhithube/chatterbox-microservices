import { MessageBroker } from '../MessageBroker';

export const createMessageBrokerMock = (): MessageBroker => ({
  publish: () => Promise.resolve(),
  subscribe: () => Promise.resolve(),
});
