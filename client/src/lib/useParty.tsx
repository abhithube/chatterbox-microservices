import { useContext } from 'react';
import { PartyContext } from './PartyProvider';

export const useParty = () => useContext(PartyContext);
