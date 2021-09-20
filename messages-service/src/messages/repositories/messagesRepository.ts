import { Client } from 'pg';
import { Message } from '../models';
import { MessageWithUser } from '../types';

export interface MessagesRepository {
  insertOne(message: Omit<Message, 'createdAt'>): Promise<Message>;
  findManyByTopicIdAndTopicIndex(
    topicId: string,
    topicIndex?: number
  ): Promise<MessageWithUser[]>;
  findOne(id: string): Promise<MessageWithUser | null>;
  findOneByTopicIdAndDate(topicId: string): Promise<Message | null>;
  deleteOne(id: string): Promise<Message | null>;
  deleteMany(): Promise<void>;
}

interface MessagesRepositoryDeps {
  dbClient: Client;
}

export function createMessagesRepository({
  dbClient,
}: MessagesRepositoryDeps): MessagesRepository {
  async function insertOne({
    id,
    topicIndex,
    body,
    userId,
    topicId,
  }: Omit<Message, 'createdAt'>): Promise<Message> {
    const result = await dbClient.query<Message>(
      `
         INSERT INTO messages (id, topic_index, body, user_id, topic_id)
         VALUES ($1, $2, $3, $4, $5)
      RETURNING id, topic_index AS "topicIndex", body, created_at AS "createdAt", user_id AS "userId", topic_id AS "topicId"
      `,
      [id, topicIndex, body, userId, topicId]
    );

    const message = result.rows[0];

    return message;
  }

  async function findManyByTopicIdAndTopicIndex(
    topicId: string,
    topicIndex?: number
  ): Promise<MessageWithUser[]> {
    const values: unknown[] = [topicId];
    let whereClause = 'WHERE m.topic_id = $1';

    if (topicIndex) {
      values.push(topicIndex);
      whereClause += ' AND m.topic_index < $2';
    }

    const result = await dbClient.query<MessageWithUser>(
      `
      SELECT m.id,
             m.topic_index AS "topicIndex",
             m.body,
             m.created_at as "createdAt",
             json_build_object('id', u.id, 'username', u.username, 'avatarUrl', u.avatar_url) AS user,
             m.topic_id AS "topicId"
        FROM messages as m
             LEFT JOIN users as u
             ON u.id = m.user_id
       ${whereClause}
       ORDER BY m.created_at DESC
       LIMIT 50
      `,
      values
    );

    const messages = result.rows;

    return messages;
  }

  async function findOne(id: string): Promise<MessageWithUser | null> {
    const result = await dbClient.query<MessageWithUser>(
      `
      SELECT m.id,
             m.topic_index AS "topicIndex",
             m.body,
             m.created_at as "createdAt",
             json_build_object('id', u.id, 'username', u.username, 'avatarUrl', u.avatar_url) AS user,
             m.topic_id AS "topicId"
        FROM messages as m
             LEFT JOIN users as u
             ON u.id = m.user_id
       WHERE m.id = $1
      `,
      [id]
    );

    const message = result.rows[0];

    return message;
  }

  async function findOneByTopicIdAndDate(
    topicId: string
  ): Promise<Message | null> {
    const result = await dbClient.query<Message>(
      `
      SELECT id,
             topic_index AS "topicIndex",
             body,
             created_at as "createdAt",
             user_id AS "userId",
             topic_id AS "topicId"
        FROM messages
       WHERE topic_id = $1
       ORDER BY created_at DESC
       LIMIT 1
      `,
      [topicId]
    );

    const message = result.rows[0];

    return message;
  }

  async function deleteOne(id: string): Promise<Message | null> {
    const result = await dbClient.query<Message>(
      `
         DELETE FROM members
          WHERE id = $1
      RETURNING id, topic_index AS "topicIndex", body, created_at AS "createdAt", user_id AS "userId", topic_id AS "topicId"
      `,
      [id]
    );

    const message = result.rows[0];

    return message;
  }

  async function deleteMany(): Promise<void> {
    await dbClient.query('DELETE FROM messages');
  }

  return {
    insertOne,
    findManyByTopicIdAndTopicIndex,
    findOne,
    findOneByTopicIdAndDate,
    deleteOne,
    deleteMany,
  };
}
