import { KafkaService } from '../kafkaService';

export const createKafkaServiceMock = (): KafkaService => ({
  publish: () => Promise.resolve(),
  subscribe: () => Promise.resolve(),
});
