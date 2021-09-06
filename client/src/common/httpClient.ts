import axios from 'axios';
import { User } from '../features/login/authSlice';

axios.defaults.baseURL = process.env.REACT_APP_SERVER_URL;

axios.interceptors.request.use(req => {
  const token = localStorage.getItem('token');

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
    req.withCredentials = true;
  }

  return req;
});

axios.interceptors.response.use(
  res => {
    return res;
  },
  async err => {
    if (err.response.status === 401 && !err.config._retry) {
      try {
        const { data } = await axios.post<{ user: User; accessToken: string }>(
          '/auth/refresh',
          {},
          {
            withCredentials: true,
          }
        );

        localStorage.setItem('token', data.accessToken);

        err.config._retry = true;

        return axios(err.config);
      } catch (err) {
        if (axios.isAxiosError(err)) console.log(err.response);
      }
    }

    return Promise.reject(err);
  }
);

async function get<T = any>(path: string) {
  try {
    const res = await axios.get<T>(path);

    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.log(err.response);
      return Promise.reject(err.response?.data);
    } else {
      return Promise.reject('Internal server error');
    }
  }
}

async function post<T = any, U = any>(path: string, data?: T) {
  try {
    const res = await axios.post<U>(path, data);

    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.log(err.response);
      return Promise.reject(err.response?.data);
    } else {
      return Promise.reject('Internal server error');
    }
  }
}

export const httpClient = {
  get,
  post,
};
