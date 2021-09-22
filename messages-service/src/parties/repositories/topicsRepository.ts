import { Client } from 'pg';
import { Topic } from '../entities';

export interface TopicsRepository {
  insertOne(topic: Topic): Promise<Topic>;
  findManyByPartyId(partyId: string): Promise<Topic[]>;
  findOne(id: string): Promise<Topic | null>;
  deleteOne(id: string): Promise<Topic | null>;
  deleteManyByPartyId(partyId?: string): Promise<void>;
}

interface TopicsRepositoryDeps {
  dbClient: Client;
}

export function createTopicsRepository({
  dbClient,
}: TopicsRepositoryDeps): TopicsRepository {
  async function insertOne({ id, name, partyId }: Topic): Promise<Topic> {
    const result = await dbClient.query<Topic>(
      `
       INSERT INTO topics(id, name, party_id)
       VALUES ($1, $2, $3)
    RETURNING id, name, party_id AS "partyId"
    `,
      [id, name, partyId]
    );

    const topic = result.rows[0];

    return topic;
  }

  async function findManyByPartyId(partyId: string): Promise<Topic[]> {
    const result = await dbClient.query<Topic>(
      `
      SELECT id, name, party_id AS "partyId"
        FROM topics
       WHERE party_id = $1
    `,
      [partyId]
    );

    const topics = result.rows;

    return topics;
  }

  async function findOne(id: string): Promise<Topic | null> {
    const result = await dbClient.query<Topic>(
      `
      SELECT id, name, party_id AS "partyId"
        FROM topics
       WHERE id = $1
    `,
      [id]
    );

    const topic = result.rows[0] || null;

    return topic;
  }

  async function deleteOne(id: string): Promise<Topic | null> {
    const result = await dbClient.query<Topic>(
      `
         DELETE FROM topics
          WHERE id = $1
      RETURNING id, name, party_id AS "partyId"
      `,
      [id]
    );

    const topic = result.rows[0] || null;

    return topic;
  }

  async function deleteManyByPartyId(partyId?: string) {
    if (partyId) {
      await dbClient.query(
        `
        DELETE FROM topics
         WHERE party_id = $1
        `,
        [partyId]
      );
    } else {
      await dbClient.query('DELETE FROM topics');
    }
  }

  return {
    insertOne,
    findManyByPartyId,
    findOne,
    deleteOne,
    deleteManyByPartyId,
  };
}
