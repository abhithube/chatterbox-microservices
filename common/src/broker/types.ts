import { Message } from './interfaces';

export type MessageHandler<T> = (message: Message<T>) => Promise<void>;
