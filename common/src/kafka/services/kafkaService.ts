import { Consumer, Kafka } from 'kafkajs';
import { KafkaOptions, MessageHandler, PublishOptions } from '../lib';

// export class KafkaServiceImpl implements KafkaService {
//   private producer: Producer;

//   private consumer: Consumer | null = null;

//   constructor(options: KafkaOptions) {
//     const { client, producer, consumer } = options;
//     const kafka = new Kafka(client);

//     this.producer = kafka.producer(producer);
//     this.producer.connect();

//     if (consumer) {
//       this.consumer = kafka.consumer(consumer);
//     }
//   }

//   async subscribe<T = any>(topic: string, handler: MessageHandler<T>) {
//     if (!this.consumer) {
//       throw new Error('Kafka consumer not configured');
//     }

//     await this.consumer.connect();

//     await this.consumer.subscribe({
//       topic,
//       fromBeginning: true,
//     });

//     await this.consumer.run({
//       eachMessage: async ({ topic: t, message }) => {
//         if (t !== topic || !message.value) {
//           return;
//         }

//         handler(JSON.parse(message.value.toString()));
//       },
//     });
//   }

//   async publish<T = any>({ topic, key, message }: PublishOptions<T>) {
//     this.producer.send({
//       topic,
//       messages: [
//         {
//           key,
//           value: JSON.stringify(message),
//         },
//       ],
//     });
//   }
// }

export interface KafkaService {
  subscribe<T = any>(topic: string, handler: MessageHandler<T>): Promise<void>;
  publish<T = any>({ topic, key, message }: PublishOptions<T>): Promise<void>;
}

export function createKafkaService({
  kafkaConfig,
  producerConfig,
  consumerConfig,
}: KafkaOptions): KafkaService {
  const kafka = new Kafka(kafkaConfig);

  const producer = kafka.producer(producerConfig);
  producer.connect();

  let consumer: Consumer | null = null;

  if (consumerConfig) {
    consumer = kafka.consumer(consumerConfig);
  }

  async function publish<T = any>({ topic, key, message }: PublishOptions<T>) {
    if (!producer) {
      throw new Error('Kafka producer not configured');
    }

    producer.send({
      topic,
      messages: [
        {
          key,
          value: JSON.stringify(message),
        },
      ],
    });
  }

  async function subscribe<T = any>(topic: string, handler: MessageHandler<T>) {
    if (!consumer) {
      throw new Error('Kafka consumer not configured');
    }

    await consumer.subscribe({
      topic,
      fromBeginning: true,
    });

    await consumer.run({
      eachMessage: async ({ topic: t, message }) => {
        if (t !== topic || !message.value) {
          return;
        }

        handler(JSON.parse(message.value.toString()));
      },
    });
  }

  return {
    publish,
    subscribe,
  };
}
