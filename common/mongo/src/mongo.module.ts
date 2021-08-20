import { DynamicModule, Module } from '@nestjs/common';
import { MongoAsyncOptions } from './interfaces';
import { MongoService } from './mongo.service';

@Module({})
export class MongoModule {
  static registerAsync(options: MongoAsyncOptions): DynamicModule {
    return {
      module: MongoModule,
      providers: [
        {
          provide: 'MONGO_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        MongoService,
      ],
      exports: [MongoService],
    };
  }
}
