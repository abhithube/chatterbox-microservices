import { HttpOptions } from './interfaces';

export interface HttpClient {
  get<T = any>(url: string, options?: HttpOptions): Promise<T>;
  post<T = any, U = any>(
    url: string,
    data?: T,
    options?: HttpOptions
  ): Promise<U>;
}
