import { Consumer, Kafka, Producer } from 'kafkajs';
import {
  KafkaMessage,
  KafkaOptions,
  PublishOptions,
  SubscribeOptions,
} from './interfaces';

export class KafkaService {
  private producer: Producer;

  private consumer: Consumer | null = null;

  private handlerMap = new Map<string, (...args: any[]) => any>();

  constructor({ client, producer, consumer }: KafkaOptions) {
    const kafka = new Kafka({
      ...client,
    });

    this.producer = kafka.producer({
      ...producer,
    });

    if (consumer) {
      this.consumer = kafka.consumer({
        ...consumer,
      });
    }

    this.init();
  }

  private async init() {
    await this.producer.connect();

    if (this.consumer) {
      await this.consumer.connect();

      await this.consumer.run({
        eachMessage: async ({ topic, message }) => {
          if (!message.value) return;

          const msg = JSON.parse(message.value.toString()) as KafkaMessage<any>;

          const handler = this.handlerMap.get(`${topic}:${msg.event}`);

          if (handler) handler(msg.data);
        },
      });
    }
  }

  async publish<T = any>({
    topic,
    key,
    message,
  }: PublishOptions<T>): Promise<void> {
    this.producer.send({
      topic,
      messages: [
        {
          key,
          value: JSON.stringify(message),
        },
      ],
    });
  }

  subscribe<T = any>({ topic, event, handler }: SubscribeOptions<T>): void {
    this.handlerMap.set(`${topic}:${event}`, handler);
  }
}
