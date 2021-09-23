import { SetOptions } from './interfaces';

export interface CacheManager {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options: SetOptions): Promise<boolean>;
  del(key: string): Promise<boolean>;
}
