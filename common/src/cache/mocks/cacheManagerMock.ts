import { CacheManager } from '../CacheManager';

export const createCacheManagerMock = (): CacheManager => ({
  connect: () => Promise.resolve(),
  disconnect: () => Promise.resolve(),
  get: () => Promise.resolve('value'),
  set: () => Promise.resolve(true),
  del: () => Promise.resolve(true),
});
