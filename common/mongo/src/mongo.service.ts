import { Inject, Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { MongoOptions } from './interfaces';

@Injectable()
export class MongoService extends MongoClient {
  constructor(@Inject('MONGO_OPTIONS') { url, options }: MongoOptions) {
    super(url, options);
  }
}
