import {
  Box,
  Flex,
  Heading,
  HStack,
  LinkBox,
  LinkOverlay,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { InviteModal } from '../invite/InviteModal';
import { selectParties } from './partiesSlice';
import { TopicModal } from './TopicModal';

export const TopicsSidebar = () => {
  const { activeParty, activeTopic } = useAppSelector(selectParties);

  if (!activeParty) return null;

  return (
    <Flex direction="column" align="center" h="full" bgColor="gray.100">
      <Heading mt={4} fontSize="2xl" textAlign="center">
        {activeParty.name}
      </Heading>
      <Box mt={4}>
        <InviteModal />
      </Box>
      <Box mt={8}>
        {activeParty.topics.map(topic => (
          <LinkBox
            key={topic.id}
            m={1}
            px={4}
            bgColor={topic.id === activeTopic?.id ? 'gray.300' : 'gray.100'}
            rounded="sm"
            _hover={{}}
          >
            <HStack>
              <Box as="span" fontSize="xl" color="teal.500">
                #
              </Box>
              <LinkOverlay
                as={RouterLink}
                to={`/parties/${activeParty.id}/topics/${topic.id}`}
              >
                <Box as="span">{topic.name}</Box>
              </LinkOverlay>
            </HStack>
          </LinkBox>
        ))}
      </Box>
      <Box mt={4}>
        <TopicModal count={activeParty.topics.length} />
      </Box>
    </Flex>
  );
};
