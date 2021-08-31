import { Consumer, Kafka, Producer } from 'kafkajs';
import { Inject, Service } from 'typedi';
import { KAFKA_OPTIONS } from './constants';
import {
  subscriberHandlerMap,
  subscriberInstanceMap,
} from './decorators/subscribe-to.decorator';
import { KafkaMessage, KafkaOptions, PublishOptions } from './interfaces';

@Service()
export class KafkaService {
  private producer: Producer;

  private consumer: Consumer | null = null;

  constructor(@Inject(KAFKA_OPTIONS) private options: KafkaOptions) {
    const { client, producer, consumer } = options;
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

      const subscribePromises: Promise<void>[] = [];

      Array.from(subscriberHandlerMap.keys()).forEach((key) => {
        subscribePromises.push(
          this.consumer!.subscribe({
            topic: key.split(':')[0],
            fromBeginning: true,
          })
        );
      });

      await Promise.all(subscribePromises);

      await this.consumer.run({
        eachMessage: async ({ topic, message }) => {
          if (!message.value) {
            return;
          }

          const msg = JSON.parse(message.value.toString()) as KafkaMessage<any>;

          const instance = subscriberInstanceMap.get(topic);
          const handler = subscriberHandlerMap.get(`${topic}:${msg.event}`);

          if (handler) {
            handler.call(instance, msg.data);
          }
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
