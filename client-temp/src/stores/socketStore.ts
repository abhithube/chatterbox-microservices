import { create } from 'zustand';
import { socket } from '../utils';

interface SocketState {
  isConnected: boolean;
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

  return {
    isConnected: false,
    connect: () => {
      socket.connect();
    },
    joinParty: (partyId: string) => {
      socket.emit('party:join', partyId);
    },
  };
});
