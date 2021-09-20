import { Box, Flex, useToast } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { MessageFeed, UserSidebar } from '../messages';
import { PartiesSidebar } from './PartiesSidebar';
import { getParty, selectParties, setActiveTopic } from './partiesSlice';
import { TopicsSidebar } from './TopicsSidebar';

type PartyPageParams = {
  partyId: string;
  topicId: string;
};

type PartyPageState = {
  joined?: boolean;
};

export const PartyPage = () => {
  const { partyId } = useParams<PartyPageParams>();

  const { isLoading, data, activeParty } = useAppSelector(selectParties);
  const dispatch = useAppDispatch();

  const location = useLocation<PartyPageState>();
  const toast = useToast();

  useEffect(() => {
    if (location.state?.joined) {
      toast({
        status: 'success',
        isClosable: true,
        description: 'Joined party successfully',
      });
    }
  }, [location, toast]);

  useEffect(() => {
    if (isLoading || data.length === 0) return;

    dispatch(getParty(partyId));
  }, [isLoading, data, partyId, dispatch]);

  useEffect(() => {
    if (!activeParty) return;

    dispatch(setActiveTopic(activeParty.topics[0]));
  }, [isLoading, activeParty, dispatch]);

  return (
    <Flex boxSize="full">
      <Box w={24}>
        <PartiesSidebar />
      </Box>
      <Box w={64}>
        <TopicsSidebar />
      </Box>
      <Box flexGrow={1}>
        <MessageFeed />
      </Box>
      <Box minW={64}>
        <UserSidebar />
      </Box>
    </Flex>
  );
};
