import { Box, Flex, useToast } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PartiesSidebar, TopicsSidebar, UserSidebar } from '../components';
import { useSocketStore } from '../stores';

export type PartyPageParams = {
  partyId?: string;
  topicId?: string;
};

export const PartyPage = () => {
  const { state } = useLocation();
  const toast = useToast();

  const { isConnected, connect } = useSocketStore();

  useEffect(() => {
    if (!isConnected) connect();
  }, [isConnected]);

  useEffect(() => {
    if (state?.joined) {
      toast({
        status: 'success',
        isClosable: true,
        description: 'Joined party successfully',
      });
    }
  }, [state]);

  return (
    <Flex boxSize="full" h="full">
      <Box w={16}>
        <PartiesSidebar />
      </Box>
      <Box w={48}>
        <TopicsSidebar />
      </Box>
      <Box flexGrow={1}></Box>
      <Box minW={64}>
        <UserSidebar />
      </Box>
    </Flex>
  );
};
