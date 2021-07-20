import { useContext } from 'react';
import { SocketContext } from './SocketProvider';

export const useSocket = () => useContext(SocketContext);
