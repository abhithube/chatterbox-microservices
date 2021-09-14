import { HttpOptions } from './interfaces';

export interface HttpClient {
  get<T>(url: string, options?: HttpOptions): Promise<T>;
  post<T, U>(url: string, data?: T, options?: HttpOptions): Promise<U>;
}
