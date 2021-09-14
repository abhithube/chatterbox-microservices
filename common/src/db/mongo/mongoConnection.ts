import { MongoClient } from 'mongodb';
import { DbConnection } from '../DbConnection';
import { DbOptions } from '../interfaces';

export async function createMongoConnection({
  url,
}: DbOptions): Promise<DbConnection<MongoClient>> {
  const mongo = new MongoClient(url);
  const client = await mongo.connect();

  function getClient() {
    return client;
  }
  return {
    getClient,
  };
}
