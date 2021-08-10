import { createContext, PropsWithChildren, useCallback, useState } from 'react';
import { PartyWithUsersAndTopics } from '../types';

type PartyContextType = {
  party: PartyWithUsersAndTopics | null;
  selectParty: (selected: PartyWithUsersAndTopics) => void;
};

export const PartyContext = createContext<PartyContextType>(
  {} as PartyContextType
);

export const PartyProvider = ({ children }: PropsWithChildren<{}>) => {
  const [party, setParty] = useState<PartyWithUsersAndTopics | null>(null);

  const selectParty = useCallback(async (selected: PartyWithUsersAndTopics) => {
    setParty(selected);
  }, []);

  return (
    <PartyContext.Provider value={{ party, selectParty }}>
      {children}
    </PartyContext.Provider>
  );
};
