import { Headers } from './interfaces';

export interface HttpClient {
  get<T = any>(url: string, headers?: Headers): Promise<T>;
  post<T = any, U = any>(url: string, data?: T, headers?: Headers): Promise<U>;
}
