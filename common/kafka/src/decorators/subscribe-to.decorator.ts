import { SubscribeToOptions } from '../interfaces';

export const subscriberInstanceMap = new Map<string, any>();
export const subscriberHandlerMap = new Map<
  string,
  (data: Record<string, any>) => void
>();

export function SubscribeTo({
  topic,
  event,
}: SubscribeToOptions): MethodDecorator {
  return (target: any, propertyKey, descriptor) => {
    subscriberHandlerMap.set(`${topic}:${event}`, target[propertyKey]);

    return descriptor;
  };
}
