import { Client } from 'pg';
import { Member } from '../entities';

export interface MembersRepository {
  insertOne(member: Member): Promise<Member>;
  findManyByPartyId(partyId: string): Promise<Member[]>;
  findOne(userId: string, partyId: string): Promise<Member | null>;
  deleteOneByUserId(userId: string): Promise<Member | null>;
  deleteManyByPartyId(partyId?: string): Promise<void>;
}

interface MembersRepositoryDeps {
  dbClient: Client;
}

export function createMembersRepository({
  dbClient,
}: MembersRepositoryDeps): MembersRepository {
  async function insertOne({ userId, partyId }: Member): Promise<Member> {
    const result = await dbClient.query<Member>(
      `
       INSERT INTO members(user_id, party_id)
       VALUES ($1, $2)
    RETURNING user_id AS "userId", party_id AS "partyId"
    `,
      [userId, partyId]
    );

    const member = result.rows[0];

    return member;
  }

  async function findManyByPartyId(partyId: string): Promise<Member[]> {
    const result = await dbClient.query<Member>(
      `
      SELECT user_id AS "userId", party_id AS "partyId"
        FROM members
       WHERE party_id = $1
    `,
      [partyId]
    );

    const members = result.rows;

    return members;
  }

  async function findOne(
    userId: string,
    partyId: string
  ): Promise<Member | null> {
    const result = await dbClient.query<Member>(
      `
      SELECT user_id AS "userId", party_id AS "partyId"
        FROM members
       WHERE user_id = $1 AND party_id = $2
    `,
      [userId, partyId]
    );

    const member = result.rows[0] || null;

    return member;
  }

  async function deleteOneByUserId(userId: string): Promise<Member | null> {
    const result = await dbClient.query<Member>(
      `
         DELETE FROM members
          WHERE user_id = $1
      RETURNING user_id AS "userId", party_id AS "partyId"
      `,
      [userId]
    );

    const member = result.rows[0] || null;

    return member;
  }

  async function deleteManyByPartyId(partyId?: string) {
    if (partyId) {
      await dbClient.query(
        `
        DELETE FROM members
         WHERE party_id = $1
        `,
        [partyId]
      );
    } else {
      await dbClient.query('DELETE FROM members');
    }
  }

  return {
    insertOne,
    findManyByPartyId,
    findOne,
    deleteOneByUserId,
    deleteManyByPartyId,
  };
}
