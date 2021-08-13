import {
  Box,
  Flex,
  Heading,
  HStack,
  Tab,
  TabList,
  Tabs,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParty } from '../../common/hooks/useParty';
import { useSocket } from '../../common/hooks/useSocket';
import { useTopic } from '../../common/hooks/useTopic';
import { Topic } from '../../types';
import { InviteModal } from '../invite/InviteModal';
import { TopicModal } from './TopicModal';

export const TopicsSidebar = () => {
  const { socket } = useSocket();
  const { party } = useParty();

  const { topic, selectTopic } = useTopic();
  const [topics, setTopics] = useState<Topic[]>([]);

  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    if (!party) return;

    setTopics(party.topics);

    const savedIndex = party.topics.findIndex(
      topic => topic.id === localStorage.getItem('topic')
    );
    setTabIndex(savedIndex >= 0 ? savedIndex : 0);
  }, [party]);

  useEffect(() => {
    if (topics.length === 0) return;

    selectTopic(topics[tabIndex]);
    localStorage.setItem('topic', topics[tabIndex].id);
  }, [tabIndex, topics, selectTopic]);

  useEffect(() => {
    if (!socket || !topic) return;

    socket.emit('leave_topic');
    socket.emit('join_topic', {
      topic: topic.id,
    });

    return () => {
      socket.emit('leave_topic');
    };
  }, [topic, socket, topics]);

  if (!party) return null;

  const addTopic = (topic: Topic) => {
    setTopics(prev => [...prev, topic]);
  };

  return (
    <Flex direction="column" align="center" h="full" bgColor="gray.100">
      <Heading mt={4} fontSize="2xl" textAlign="center">
        {party.name}
      </Heading>
      <Box mt={4}>
        <InviteModal />
      </Box>
      <Tabs
        orientation="vertical"
        variant="unstyled"
        index={tabIndex}
        onChange={index => setTabIndex(index)}
        mt={8}
        w="full"
      >
        <TabList my={2} w="full">
          {topics.map(topic => (
            <Tab
              key={topic.id}
              w="full"
              padding={1}
              _selected={{
                bgColor: 'gray.200',
                fontWeight: 'bold',
              }}
            >
              <HStack>
                <Box as="span" fontSize="lg" color="gray.500">
                  #
                </Box>
                <Box as="span">{topic.name}</Box>
              </HStack>
            </Tab>
          ))}
        </TabList>
      </Tabs>
      <Box mt={4}>
        <TopicModal count={topics.length} addTopic={addTopic} />
      </Box>
    </Flex>
  );
};
