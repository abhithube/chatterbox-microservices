import { useContext } from 'react';
import { PartyContext } from '../providers/PartyProvider';

export const useParty = () => useContext(PartyContext);
