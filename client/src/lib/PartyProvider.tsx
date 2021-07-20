import axios from 'axios';
import { createContext, PropsWithChildren, useCallback, useState } from 'react';
import { PartyWithUsersAndTopics } from '../types';
import { useAuth } from './useAuth';
import { useSocket } from './useSocket';

type PartyContextType = {
  party: PartyWithUsersAndTopics | null;
  online: string[];
  selectParty: (id: string) => Promise<void>;
  loading: boolean;
};

export const PartyContext = createContext<PartyContextType>(
  {} as PartyContextType
);

export const PartyProvider = ({ children }: PropsWithChildren<{}>) => {
  const [party, setParty] = useState<PartyWithUsersAndTopics | null>(null);
  const [online, setOnline] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const { auth } = useAuth();
  const { socket, createSocket } = useSocket();

  const selectParty = useCallback(
    async (id: string) => {
      if (!auth || id === party?.id) return;

      setLoading(true);

      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/parties/${id}`
        );

        setParty(data);
        localStorage.setItem('party', data.id);

        if (socket) socket.disconnect();

        const s = createSocket(auth.accessToken, id);
        s.on('connected_users', (users: string[]) => setOnline(users));
      } catch (err) {
        console.log(err.response);
      } finally {
        setLoading(false);
      }
    },
    [auth, party, socket, createSocket]
  );

  return (
    <PartyContext.Provider value={{ party, online, selectParty, loading }}>
      {children}
    </PartyContext.Provider>
  );
};
