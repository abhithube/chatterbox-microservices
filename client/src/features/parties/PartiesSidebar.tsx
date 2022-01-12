import { Avatar, Flex, Link, Tooltip } from '@chakra-ui/react';
import { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { getParties, selectParties } from './partiesSlice';
import { PartyModal } from './PartyModal';

export const PartiesSidebar = () => {
  const { data: parties, activeParty } = useAppSelector(selectParties);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (parties.length === 0) dispatch(getParties());
  }, [parties, dispatch]);

  return (
    <Flex direction="column" align="center" pt={4} h="full" bgColor="gray.300">
      {parties.map((party) => (
        <Link
          key={party.id}
          as={RouterLink}
          to={`/parties/${party.id}`}
          m={2}
          px={2}
          borderLeftWidth={3}
          borderLeftColor={
            party.id === activeParty?.id ? 'teal.500' : 'gray.300'
          }
          _hover={{}}
        >
          <Tooltip label={party.name} placement="right">
            <Avatar name={party.name} />
          </Tooltip>
        </Link>
      ))}
      <PartyModal count={parties.length} />
    </Flex>
  );
};
