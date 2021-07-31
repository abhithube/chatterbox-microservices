import { DynamicModule, Module } from '@nestjs/common';
import { KafkaAsyncOptions } from './interfaces';
import { KafkaService } from './kafka.service';

@Module({})
export class KafkaModule {
  static registerAsync(options: KafkaAsyncOptions): DynamicModule {
    return {
      module: KafkaModule,
      providers: [
        {
          provide: 'KAFKA_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        KafkaService,
      ],
      exports: [KafkaService],
    };
  }
}
