import { Avatar, Box, Link, Spinner, Tooltip, VStack } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Party } from '../interfaces';
import { PartyPageParams } from '../pages';
import { http } from '../utils';
import { PartyModal } from './PartyModal';

export const PartiesSidebar = () => {
  const { partyId } = useParams<PartyPageParams>();

  const { data, isLoading } = useQuery<Party[]>({
    queryKey: ['parties'],
    queryFn: () => http.get('/parties/@me'),
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (partyId || !data || data.length == 0) return;

    if (!partyId) navigate(`/${data[0]._id}`);
  }, [data]);

  if (!data || isLoading) return <Spinner />;

  return (
    <VStack
      alignItems="start"
      pt={4}
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
          borderLeftColor={party._id === partyId ? 'teal.500' : 'gray.300'}
          _hover={{}}
        >
          <Tooltip label={party.name} placement="right">
            <Avatar name={party.name} ml={1} />
          </Tooltip>
        </Link>
      ))}
      <Box alignSelf="center">
        <PartyModal />
      </Box>
    </VStack>
  );
};
