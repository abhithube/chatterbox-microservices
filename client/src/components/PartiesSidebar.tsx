import { Avatar, Box, Link, Spinner, Tooltip, VStack } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Party } from '../interfaces';
import { useSocketStore } from '../stores';
import { http } from '../utils';
import { PartyModal } from './PartyModal';

type PartiesSidebarProps = {
  partyId: string | undefined;
};

export const PartiesSidebar = ({ partyId }: PartiesSidebarProps) => {
  const { isConnected, joinParty } = useSocketStore();

  const { data, isLoading } = useQuery<Party[]>({
    queryKey: ['parties'],
    queryFn: () => http.get('/parties/@me'),
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (partyId || !data || data.length == 0) return;

    navigate(`/${data[0]._id}`);
  }, [data]);

  useEffect(() => {
    if (!partyId || !isConnected) return;

    joinParty(partyId);
  }, [partyId, isConnected]);

  if (!data || isLoading) return <Spinner />;

  return (
    <VStack
      pt={4}
      pr={2}
      h="full"
      bgColor="gray.900"
      borderRightWidth={1}
      borderRightColor="gray.600"
    >
      {data.map((party) => (
        <Link
          key={party._id}
          as={RouterLink}
          to={`/${party._id}`}
          borderLeftWidth={3}
          borderLeftColor={party._id === partyId ? 'teal.300' : undefined}
          _hover={{}}
        >
          <Tooltip label={party.name} placement="right">
            <Avatar name={party.name} ml={1} />
          </Tooltip>
        </Link>
      ))}
      <Box pl="2">
        <PartyModal />
      </Box>
    </VStack>
  );
};
