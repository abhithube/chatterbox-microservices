import { Box, Flex } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { MessagePanel } from '../messages/MessagePanel';
import { PartiesSidebar } from './PartiesSidebar';
import { selectParties, setActiveParty, setActiveTopic } from './partiesSlice';
import { TopicsSidebar } from './TopicsSidebar';

type PartyPageParams = {
  partyId: string;
  topicId: string;
};

export const PartyPage = () => {
  const { partyId, topicId } = useParams<PartyPageParams>();

  const { isLoading, data, activeParty } = useAppSelector(selectParties);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isLoading || data.length === 0) return;

    const party = data.find(party => party.id === partyId)!;
    dispatch(setActiveParty(party));
  }, [isLoading, data, partyId, dispatch]);

  useEffect(() => {
    if (isLoading || !activeParty) return;

    const topic = activeParty.topics.find(topic => topic.id === topicId)!;
    if (topic) dispatch(setActiveTopic(topic));
  }, [isLoading, activeParty, topicId, dispatch]);

  return (
    <Flex boxSize="full">
      <Box w={24}>
        <PartiesSidebar />
      </Box>
      <Box w={64}>
        <TopicsSidebar />
      </Box>
      <MessagePanel />
    </Flex>
  );
};
