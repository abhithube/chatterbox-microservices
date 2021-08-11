import { Flex } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { PartiesSidebar } from '../components/PartiesSidebar';
import { PartyPanel } from '../components/PartyPanel';

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
