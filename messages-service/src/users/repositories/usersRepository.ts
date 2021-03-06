import { Client } from 'pg';
import { User } from '../models';

export interface UsersRepository {
  insertOne(user: User): Promise<User>;
  findOne(id: string): Promise<User | null>;
  deleteMany(): Promise<void>;
}

interface UsersRepositoryDeps {
  dbClient: Client;
}

export function createUsersRepository({
  dbClient,
}: UsersRepositoryDeps): UsersRepository {
  async function insertOne({ id, username, avatarUrl }: User): Promise<User> {
    const result = await dbClient.query<User>(
      `
      INSERT INTO users(id, username, avatar_url)
      VALUES ($1, $2, $3)
      RETURNING id, username, avatar_url AS "avatarUrl"
      `,
      [id, username, avatarUrl]
    );

    const user = result.rows[0];

    return user;
  }

  async function findOne(id: string): Promise<User | null> {
    const result = await dbClient.query<User>(
      `
      SELECT id, username, avatar_url AS "avatarUrl"
        FROM members
       WHERE user_id = $1 AND party_id = $2
    `,
      [id]
    );

    const user = result.rows[0] || null;

    return user;
  }

  async function deleteMany(): Promise<void> {
    await dbClient.query('DELETE FROM users');
  }

  return {
    insertOne,
    findOne,
    deleteMany,
  };
}
