import bcrypt from 'bcrypt';
import { PasswordHasher } from './PasswordHasher';

export function createBcryptHasher(): PasswordHasher {
  async function hash(data: string): Promise<string> {
    return bcrypt.hash(data, 10);
  }

  function hashSync(data: string): string {
    return bcrypt.hashSync(data, 10);
  }

  async function compare(data: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(data, hashed);
  }

  function compareSync(data: string, hashed: string): boolean {
    return bcrypt.compareSync(data, hashed);
  }

  return {
    hash,
    hashSync,
    compare,
    compareSync,
  };
}
