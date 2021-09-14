import { BrokerClient } from '../BrokerClient';

export const createBrokerClientMock = (): BrokerClient => ({
  publish: () => Promise.resolve(),
  subscribe: () => Promise.resolve(),
});
