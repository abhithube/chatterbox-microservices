import { Flex } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { PartiesSidebar } from './PartiesSidebar';
import { PartyPanel } from './PartyPanel';

type PartyPageParams = {
  id: string;
};

export const PartyPage = () => {
  const { id } = useParams<PartyPageParams>();

  return (
    <Flex boxSize="full">
      <PartiesSidebar initId={id} />
      <PartyPanel />
    </Flex>
  );
};
