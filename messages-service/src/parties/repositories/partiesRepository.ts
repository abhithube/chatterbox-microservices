import { Client } from 'pg';
import { Party } from '../entities';
import { PartyWithMembersAndTopics } from '../types';

export interface PartiesRepository {
  insertOne(party: Partial<Party>): Promise<Party>;
  findManyByUserId(userId: string): Promise<Party[]>;
  findOne(id: string): Promise<Party | null>;
  findOneWithMembersAndTopics(
    id: string
  ): Promise<PartyWithMembersAndTopics | null>;
  deleteOne(id: string): Promise<Party | null>;
  deleteMany(): Promise<void>;
}

interface PartiesRepositoryDeps {
  dbClient: Client;
}

export function createPartiesRepository({
  dbClient,
}: PartiesRepositoryDeps): PartiesRepository {
  async function insertOne({ id, name, inviteToken }: Party): Promise<Party> {
    const result = await dbClient.query<Party>(
      `
       INSERT INTO parties(id, name, invite_token)
       VALUES ($1, $2, $3)
    RETURNING id, name, invite_token AS "inviteToken"
    `,
      [id, name, inviteToken]
    );

    const party = result.rows[0];

    return party;
  }

  async function findManyByUserId(userId: string): Promise<Party[]> {
    const result = await dbClient.query<Party>(
      `
      SELECT p.id, p.name, p.invite_token AS "inviteToken"
        FROM members as m
             LEFT JOIN parties AS p
             ON p.id = m.party_id
       WHERE m.user_id = $1
      `,
      [userId]
    );

    const parties = result.rows;

    return parties;
  }

  async function findOne(id: string): Promise<Party | null> {
    const partyResult = await dbClient.query<Party>(
      `
      SELECT id,
             name,
             invite_token AS "inviteToken"
        FROM parties
       WHERE id = $1
      `,
      [id]
    );

    const party = partyResult.rows[0] || null;

    return party;
  }

  async function findOneWithMembersAndTopics(
    id: string
  ): Promise<PartyWithMembersAndTopics | null> {
    const result = await dbClient.query<PartyWithMembersAndTopics>(
      `
      SELECT p.id,
             p.name,
             p.invite_token AS "inviteToken",
             CASE WHEN COUNT(u) = 0
                  THEN '[]'
                  ELSE json_agg(DISTINCT jsonb_build_object('id', u.id, 'username', u.username, 'avatarUrl', u.avatar_url))
             END AS members,
             CASE WHEN COUNT(t) = 0
                  THEN '[]'
                  ELSE json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'partyId', t.party_id))
             END AS topics
        FROM parties AS p
             LEFT JOIN members AS m
             ON m.party_id = p.id
             LEFT JOIN users AS u
             ON m.user_id = u.id
             LEFT JOIN topics AS t
             ON t.party_id = p.id
       WHERE p.id = $1
       GROUP BY p.id
      `,
      [id]
    );

    const party = result.rows[0] || null;

    return party;
  }

  async function deleteOne(id: string): Promise<Party | null> {
    const result = await dbClient.query<Party>(
      `
         DELETE FROM parties
          WHERE id = $1
      RETURNING id, name, invite_token AS "inviteToken"
      `,
      [id]
    );

    const party = result.rows[0] || null;

    return party;
  }

  async function deleteMany() {
    await dbClient.query('DELETE FROM parties');
  }

  return {
    insertOne,
    findManyByUserId,
    findOne,
    findOneWithMembersAndTopics,
    deleteOne,
    deleteMany,
  };
}
