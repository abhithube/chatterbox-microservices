import axios from 'axios';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useHistory } from 'react-router-dom';
import { Party, PartyWithUsersAndTopics } from '../types';
import { useAuth } from './useAuth';

type PartyContextType = {
  party: PartyWithUsersAndTopics | null;
  selectParty: (selected: PartyWithUsersAndTopics) => void;
  parties: Party[];
  addParty: (party: Party) => void;
};

export const PartyContext = createContext<PartyContextType>(
  {} as PartyContextType
);

export const PartyProvider = ({ children }: PropsWithChildren<{}>) => {
  const { auth } = useAuth();

  const [party, setParty] = useState<PartyWithUsersAndTopics | null>(null);
  const [parties, setParties] = useState<Party[]>([]);

  const history = useHistory();

  const selectParty = useCallback(async (selected: PartyWithUsersAndTopics) => {
    setParty(selected);
  }, []);

  const addParty = useCallback(async (party: Party) => {
    setParties(prev => [...prev, party]);
  }, []);

  useEffect(() => {
    if (!auth) return;

    (async () => {
      try {
        const { data } = await axios.get<Party[]>(
          `${process.env.REACT_APP_SERVER_URL}/parties/@me`
        );

        setParties(data);
      } catch (err) {
        console.log(err.response);
      }
    })();
  }, [auth]);

  useEffect(() => {
    if (!party && parties.length > 0) history.push(`/parties/${parties[0].id}`);
  }, [history, parties, party]);

  return (
    <PartyContext.Provider value={{ party, selectParty, parties, addParty }}>
      {children}
    </PartyContext.Provider>
  );
};
