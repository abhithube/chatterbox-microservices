/* eslint-disable @typescript-eslint/no-var-requires */
const { mockDeep } = require('jest-mock-extended');
const { Kafka } = require('kafkajs');

jest.mock('./src/config/kafka', () => ({
  __esModule: true,
  default: mockDeep(Kafka),
}));

jest.mock('./src/config/initializeTopics', () => jest.fn());
