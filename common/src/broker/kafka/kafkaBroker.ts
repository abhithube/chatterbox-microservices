import { Consumer, Kafka } from 'kafkajs';
import { PublishOptions } from '../interfaces';
import { MessageBroker } from '../MessageBroker';
import { MessageHandler } from '../types';
import { KafkaOptions } from './interfaces';

export async function createKafkaBroker({
  kafkaConfig,
  producerConfig,
  consumerConfig,
}: KafkaOptions): Promise<MessageBroker> {
  const kafka = new Kafka(kafkaConfig);

  const producer = kafka.producer(producerConfig);
  await producer.connect();

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
