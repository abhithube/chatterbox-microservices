import { Box } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParty } from '../../common/hooks/useParty';
import { useSocket } from '../../common/hooks/useSocket';
import { MessageFeed } from '../messages/MessageFeed';
import { TopicsSidebar } from '../topics/TopicsSidebar';
import { UserSidebar } from './UserSidebar';

export const PartyPanel = () => {
  const { socket, createSocket } = useSocket();
  const { party, selectParty } = useParty();

  const [online, setOnline] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !party) return;

    try {
      (async () => {
        const s = createSocket(token, party.id);
        s.on('connected_users', (users: string[]) => setOnline(users));
      })();
    } catch (err) {
      console.log(err.response);
    }
  }, [party, selectParty, createSocket]);

  useEffect(() => {
    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  return (
    <>
      {party && (
        <>
          <Box minW={64}>
            <TopicsSidebar />
          </Box>
          <Box flexGrow={1}>
            <MessageFeed />
          </Box>
          <Box minW={64}>
            <UserSidebar users={party.users} online={online} />
          </Box>
        </>
      )}
    </>
  );
};
