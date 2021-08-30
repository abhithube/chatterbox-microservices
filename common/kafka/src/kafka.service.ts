import { Consumer, Kafka, Producer } from 'kafkajs';
import { Container, Service } from 'typedi';
import { KAFKA_OPTIONS } from './constants';
import {
  subscriberHandlerMap,
  subscriberInstanceMap,
} from './decorators/subscribe-to.decorator';
import { KafkaMessage, PublishOptions } from './interfaces';

@Service()
export class KafkaService {
  private producer: Producer;

  private consumer: Consumer | null = null;

  constructor() {
    if (!Container.has(KAFKA_OPTIONS)) {
      throw new Error('Kafka options not configured');
    }

    const { client, producer, consumer } = Container.get(KAFKA_OPTIONS);

    const kafka = new Kafka(client);

    this.producer = kafka.producer(producer);

    if (consumer) {
      this.consumer = kafka.consumer(consumer);
    }

    this.init();
  }

  private async init() {
    await this.producer.connect();

    if (this.consumer) {
      await this.consumer.connect();

      const subscriptions: Promise<void>[] = [];

      Array.from(subscriberHandlerMap.keys()).forEach((key) => {
        subscriptions.push(
          this.consumer!.subscribe({
            topic: key.split(':')[0],
            fromBeginning: true,
          })
        );
      });

      await Promise.all(subscriptions);

      await this.consumer.run({
        eachMessage: async ({ topic, message }) => {
          if (!message.value) return;

          const msg = JSON.parse(message.value.toString()) as KafkaMessage<any>;

          const instance = subscriberInstanceMap.get(topic);
          const handler = subscriberHandlerMap.get(`${topic}:${msg.event}`);

          if (handler) handler.call(instance, msg.data);
        },
      });
    }
  }

  bindConsumer<T = any>(topic: string, instance: T): void {
    subscriberInstanceMap.set(topic, instance);
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
}
