export interface Message<T> {
  event: string;
  data: T;
}
