import { Box, Flex } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  MessagesFeed,
  PartiesSidebar,
  TopicsSidebar,
  UsersSidebar,
} from '../components';
import { PartyDetails } from '../interfaces';
import { useSocketStore } from '../stores';
import { http } from '../utils';

export type PartyPageParams = {
  partyId?: string;
  topicId?: string;
};

export const PartyPage = () => {
  const { partyId, topicId } = useParams<PartyPageParams>();

  const { isConnected, connect, disconnect } = useSocketStore();

  const { data } = useQuery<PartyDetails>({
    queryKey: ['parties', partyId],
    queryFn: () => http.get(`/parties/${partyId}`),
    enabled: !!partyId,
  });

  useEffect(() => {
    if (!isConnected) connect();

    return () => {
      if (isConnected) disconnect();
    };
  }, [isConnected]);

  return (
    <Flex boxSize="full">
      <Box w={16}>
        <PartiesSidebar partyId={partyId} />
      </Box>
      <Box w={48}>
        <TopicsSidebar party={data} topicId={topicId} />
      </Box>
      <Box flexGrow={1}>
        <MessagesFeed party={data} topicId={topicId} />
      </Box>
      <Box minW={64}>
        <UsersSidebar party={data} />
      </Box>
    </Flex>
  );
};
