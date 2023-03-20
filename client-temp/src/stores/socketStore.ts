import { create } from 'zustand';
import { socket } from '../utils';

interface SocketState {
  isConnected: boolean;
  connect: () => void;
}

export const useSocketStore = create<SocketState>()((set) => {
  socket.on('connect', () => {
    set(() => ({ isConnected: true }));
  });

  socket.on('disconnect', () => {
    set(() => ({ isConnected: false }));
  });

  return {
    isConnected: false,
    connect: () => {
      socket.connect();
    },
  };
});
