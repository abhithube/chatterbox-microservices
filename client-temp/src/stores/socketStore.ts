import { create } from 'zustand';
import { socket } from '../utils';

interface SocketState {
  isConnected: boolean;
  activeUsers: string[];
  connect: () => void;
  joinParty: (partyId: string) => void;
}

export const useSocketStore = create<SocketState>()((set) => {
  socket.on('connect', () => {
    set(() => ({ isConnected: true }));
  });

  socket.on('disconnect', () => {
    set(() => ({ isConnected: false }));
  });

  socket.on('user:online', (users: string[]) => {
    set(() => ({ activeUsers: users }));
  });

  return {
    isConnected: false,
    activeUsers: [],
    connect: () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      socket.io.opts.extraHeaders = {
        authorization: `Bearer ${token}`,
      };

      socket.connect();
    },
    joinParty: (partyId: string) => {
      socket.emit('party:join', partyId);
    },
  };
});
