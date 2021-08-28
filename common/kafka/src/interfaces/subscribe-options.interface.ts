export interface SubscribeOptions<T = any> {
  topic: string;
  event: string;
  handler: (data: T) => void;
}
