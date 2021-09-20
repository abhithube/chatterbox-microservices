import { Box, Flex, Heading, HStack } from '@chakra-ui/react';
import { setActiveTopic } from '.';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { InviteModal } from '../invite';
import { selectParties, Topic } from './partiesSlice';
import { TopicModal } from './TopicModal';

export const TopicsSidebar = () => {
  const { activeParty, activeTopic } = useAppSelector(selectParties);
  const dispatch = useAppDispatch();

  if (!activeParty) return null;

  const handleClick = (topic: Topic) => {
    dispatch(setActiveTopic(topic));
  };

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
          <Box
            key={topic.id}
            m={1}
            px={4}
            bgColor={topic.id === activeTopic?.id ? 'gray.300' : 'gray.100'}
            rounded="sm"
            _hover={{ cursor: 'pointer' }}
            onClick={() => handleClick(topic)}
          >
            <HStack>
              <Box as="span" fontSize="xl" color="teal.500">
                #
              </Box>
              <Box as="span">{topic.name}</Box>
            </HStack>
          </Box>
        ))}
      </Box>
      <Box mt={4}>
        <TopicModal count={activeParty.topics.length} />
      </Box>
    </Flex>
  );
};
