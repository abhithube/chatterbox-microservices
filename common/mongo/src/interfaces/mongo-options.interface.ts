import { MongoClientOptions } from 'mongodb';

export interface MongoOptions {
  url: string;
  options?: MongoClientOptions;
}
