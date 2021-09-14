import { HttpClient } from '../HttpClient';

export const createHttpClientMock = (): HttpClient => ({
  get<T>() {
    return Promise.resolve({} as T);
  },
  post<T>() {
    return Promise.resolve({} as T);
  },
});
