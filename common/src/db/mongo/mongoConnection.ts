import { MongoClient } from 'mongodb';
import { DbConnection } from '../DbConnection';
import { MongoOptions } from './interfaces';

export async function createMongoConnection({
  url,
  options,
}: MongoOptions): Promise<DbConnection<MongoClient>> {
  const mongo = new MongoClient(url, options);
  const client = await mongo.connect();

  function getClient() {
    return client;
  }
  return {
    getClient,
  };
}
