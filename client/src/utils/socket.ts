import { io } from 'socket.io-client'

export const socket = io(import.meta.env.VITE_BACKEND_URL, {
  path: '/messages/socket.io',
  transports: ['polling'],
  autoConnect: false,
})
