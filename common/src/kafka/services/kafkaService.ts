import { Consumer, Kafka } from 'kafkajs';
import { KafkaOptions, MessageHandler, PublishOptions } from '../lib';

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
