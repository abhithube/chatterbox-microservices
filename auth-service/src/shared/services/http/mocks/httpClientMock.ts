import { HttpClient } from '../HttpClient';

export const createHttpClientMock = (): HttpClient => ({
  get: () => Promise.resolve({} as any),
  post: () => Promise.resolve({} as any),
});
