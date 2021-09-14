import Redis from 'ioredis';
import { CacheManager } from '../CacheManager';
import { CacheOptions, SetOptions } from '../interfaces';

export function createRedisManager({
  url,
  defaultExpiryTime,
}: CacheOptions): CacheManager {
  const client = new Redis(url);

  async function get(key: string): Promise<string | null> {
    return client.get(key);
  }

  async function set(
    key: string,
    value: string,
    { expiryTime }: SetOptions
  ): Promise<boolean> {
    const ok = await client.set(
      key,
      value,
      'EX',
      expiryTime || defaultExpiryTime
    );

    return ok !== null;
  }

  async function del(key: string): Promise<boolean> {
    const deletedCount = await client.del(key);

    return deletedCount === 1;
  }

  return {
    get,
    set,
    del,
  };
}
