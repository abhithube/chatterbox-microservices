import { RandomGenerator } from '../RandomGenerator';

export const createRandomGeneratorMock = (): RandomGenerator => ({
  generate: () => '1',
});
