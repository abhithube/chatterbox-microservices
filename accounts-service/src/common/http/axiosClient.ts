import axios from 'axios';
import { Headers, HttpClient } from './HttpClient';

export function creatAxiosClient(): HttpClient {
  async function get<T = any>(url: string, headers?: Headers): Promise<T> {
    const res = await axios.get<T>(url, { headers });

    return res.data;
  }

  async function post<T = any, U = any>(
    url: string,
    data?: T,
    headers?: Headers
  ): Promise<U> {
    const res = await axios.post<U>(url, data, { headers });

    return res.data;
  }

  return {
    get,
    post,
  };
}
