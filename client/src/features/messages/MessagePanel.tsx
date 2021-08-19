import { Box } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useAppSelector } from '../../app/hooks';
// import { socketClient } from '../../common/socketClient';
import { selectParties } from '../parties/partiesSlice';
import { MessageFeed } from './MessageFeed';
import { UserSidebar } from './UserSidebar';

export const MessagePanel = () => {
  const { activeParty, activeTopic } = useAppSelector(selectParties);

  useEffect(() => {
    if (!activeTopic) return;

    // socketClient.emit('join_topic', {
    //   topic: activeTopic.id,
    // });

    // return () => {
    //   socketClient.emit('leave_topic');
    // };
  }, [activeTopic]);

  // useEffect(() => {
  //   return () => {
  //     socketClient.disconnect();
  //   };
  // }, []);

  return (
    <>
      {activeParty && (
        <>
          <Box flexGrow={1}>
            <MessageFeed />
          </Box>
          <Box minW={64}>
            <UserSidebar />
          </Box>
        </>
      )}
    </>
  );
};
