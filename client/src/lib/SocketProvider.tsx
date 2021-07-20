import { createContext, PropsWithChildren, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

type SocketContextType = {
  socket: Socket | null;
  createSocket: (token: string, party: string) => Socket;
};

export const SocketContext = createContext<SocketContextType>(
  {} as SocketContextType
);

export const SocketProvider = ({ children }: PropsWithChildren<{}>) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  const createSocket = useCallback((token: string, party: string) => {
    const s = io(process.env.REACT_APP_SERVER_URL!, {
      extraHeaders: {
        authorization: `Bearer ${token}`,
      },
      query: {
        party,
      },
    });

    setSocket(s);
    return s;
  }, []);

  return (
    <SocketContext.Provider value={{ socket, createSocket }}>
      {children}
    </SocketContext.Provider>
  );
};
