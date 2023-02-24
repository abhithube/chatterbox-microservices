import { Box, Flex, useToast } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PartiesSidebar, TopicsSidebar } from '../components';

export type PartyPageParams = {
  partyId?: string;
  topicId?: string;
};

export const PartyPage = () => {
  // const { isLoading, data, activeParty } = useAppSelector(selectParties);
  // const dispatch = useAppDispatch();

  const { state } = useLocation();
  const toast = useToast();

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
      {/* <Box flexGrow={1}>
        <MessageFeed />
      </Box>
      <Box minW={64}>
        <UserSidebar />
      </Box> */}
    </Flex>
  );
};
