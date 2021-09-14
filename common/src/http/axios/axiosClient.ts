import axios from 'axios';
import { HttpClient } from '../HttpClient';
import { HttpOptions } from '../interfaces';

export function createAxiosClient(): HttpClient {
  async function get<T>(url: string, options?: HttpOptions): Promise<T> {
    const res = await axios.get<T>(url, options);

    return res.data;
  }

  async function post<T, U>(
    url: string,
    data?: T,
    options?: HttpOptions
  ): Promise<U> {
    const res = await axios.post<U>(url, data, options);

    return res.data;
  }

  return {
    get,
    post,
  };
}
