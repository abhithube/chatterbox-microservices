import { ConfigManager } from '../ConfigManager';

export function createDotenvManager(): ConfigManager {
  function get(key: string): string | undefined {
    return process.env[key];
  }

  return {
    get,
  };
}
