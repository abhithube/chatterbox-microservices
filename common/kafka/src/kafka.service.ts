import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Consumer, Kafka, Producer } from 'kafkajs';
import {
  subscriberHandlerMap,
  subscriberInstanceMap,
} from './decorators/kafka.decorator';
import { KafkaEvent, KafkaMessage, KafkaOptions } from './interfaces';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  constructor(
    @Inject('KAFKA_OPTIONS') { client, producer, consumer }: KafkaOptions,
  ) {
    this.kafka = new Kafka({
      ...client,
    });

    this.producer = this.kafka.producer({
      ...producer,
    });

    if (consumer) {
      this.consumer = this.kafka.consumer({
        ...consumer,
      });
    }
  }

  async onModuleInit(): Promise<void> {
    await this.producer.connect();

    if (this.consumer) {
      await this.consumer.connect();

      for (const [subscriberKey] of subscriberHandlerMap) {
        await this.consumer.subscribe({
          topic: subscriberKey.split(':')[0],
          fromBeginning: true,
        });
      }

      await this.consumer.run({
        eachMessage: async ({ topic, message }) => {
          const event = JSON.parse(message.value.toString()) as KafkaEvent<any>;

          const instance = subscriberInstanceMap.get(topic);
          const handler = subscriberHandlerMap.get(`${topic}:${event.type}`);

          if (handler) handler.call(instance, event.data);
        },
      });
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.producer.disconnect();
    if (this.consumer) await this.consumer.disconnect();
  }

  bindConsumer<T = any>(topic: string, instance: T): void {
    subscriberInstanceMap.set(topic, instance);
  }

  async publish<T = any>(
    topic: string,
    message: KafkaMessage<T>,
  ): Promise<void> {
    this.producer.send({
      topic,
      messages: [
        {
          key: message.key,
          value: JSON.stringify(message.value),
        },
      ],
    });
  }
}
