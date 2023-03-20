import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_BACKEND_URL, {
  path: '/messages/socket.io',
  autoConnect: false,
  auth: (cb) => {
    cb({ token: localStorage.getItem('token') });
  },
});
