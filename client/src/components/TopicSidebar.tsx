import {
  Box,
  Heading,
  Icon,
  IconButton,
  Tab,
  TabList,
  Tabs,
  Tooltip,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useParty } from '../lib/useParty';
import { useSocket } from '../lib/useSocket';
import { useTopic } from '../lib/useTopic';

export const TopicSidebar = () => {
  const { socket } = useSocket();
  const { party } = useParty();
  const { topic, selectTopic } = useTopic();

  useEffect(() => {
    if (party) selectTopic(party.topics[0].id);
  }, [party, selectTopic]);

  useEffect(() => {
    if (!topic) return;

    socket!.emit('leave_topic');
    socket!.emit('join_topic', topic.id);

    return () => {
      socket!.emit('leave_topic');
    };
  }, [topic, socket]);

  return (
    <Box h="full" w={64} bgColor="gray.700">
      <Heading pt={4} fontSize="2xl" textAlign="center" color="gray.50">
        Topics
      </Heading>
      <Tabs orientation="vertical" variant="unstyled">
        <TabList alignItems="center" mt="4" w="full">
          {party?.topics.map(topic => (
            <Tab
              key={topic.id}
              onClick={() => selectTopic(topic.id)}
              mb={2}
              w="75%"
              borderRadius="lg"
              color="gray.400"
              _selected={{ bgColor: 'gray.600', color: 'gray.50' }}
              _hover={{ bgColor: 'gray.600' }}
            >
              <Box as="span">#{topic.name}</Box>
            </Tab>
          ))}
          <Tooltip label="Create a new topic" placement="right">
            <IconButton
              icon={<Icon as={FaPlus} />}
              aria-label="create-topic-button"
              colorScheme="teal"
              variant="outline"
              w="12"
              h="12"
            />
          </Tooltip>
        </TabList>
      </Tabs>
    </Box>
  );
};
