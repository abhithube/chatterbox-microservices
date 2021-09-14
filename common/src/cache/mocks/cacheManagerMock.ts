import { CacheManager } from '../CacheManager';

export const createCacheManagerMock = (): CacheManager => ({
  get: () => Promise.resolve('value'),
  set: () => Promise.resolve(true),
  del: () => Promise.resolve(true),
});
