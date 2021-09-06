import crypto from 'crypto';
import { RandomGenerator } from './RandomGenerator';

export function createUuidGenerator(): RandomGenerator {
  function generate(): string {
    return crypto.randomUUID();
  }

  return {
    generate,
  };
}
