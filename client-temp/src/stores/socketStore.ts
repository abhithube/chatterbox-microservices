import { create } from 'zustand';
import { Message } from '../interfaces';
import { socket } from '../utils';

interface SocketState {
  isConnected: boolean;
  activeUsers: string[];
  messages: Message[];
  connect: () => void;
  disconnect: () => void;
  joinParty: (partyId: string) => void;
  joinTopic: (topicId: string) => void;
  sendMessage: (body: string) => void;
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

  socket.on('message:append', (message: Message) => {
    set(({ messages }) => ({ messages: [message, ...messages] }));
  });

  return {
    isConnected: false,
    activeUsers: [],
    messages: [],
    connect: () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      socket.io.opts.extraHeaders = {
        authorization: `Bearer ${token}`,
      };

      socket.connect();
    },
    disconnect: () => socket.disconnect(),
    joinParty: (partyId) => socket.emit('party:join', partyId),
    joinTopic: (topicId) => {
      set(() => ({ messages: [] }));

      socket.emit('topic:join', topicId, (messages: Message[]) => {
        set(() => ({ messages }));
      });
    },
    sendMessage: (body) => socket.emit('message:create', body),
  };
});
