import { Box, Stack, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useSocketStore } from '../stores';
import { PartyDetails } from '../types';
import { CreateMessageForm } from './CreateMessageForm';
import { MessageItem } from './MessageItem';

type MessagesFeedProps = {
  party: PartyDetails | undefined;
  topicId: string | undefined;
};

export const MessagesFeed = ({ party, topicId }: MessagesFeedProps) => {
  const { messages, joinTopic } = useSocketStore();

  const topic = party?.topics.find((t) => t._id === topicId);

  useEffect(() => {
    if (!topicId) return;

    joinTopic(topicId);
  }, [topicId]);

  return (
    <Box h="full" p={8} bgColor="gray.700">
      <Stack
        direction="column-reverse"
        align="flex-start"
        spacing={4}
        my={8}
        h="85%"
        overflowY="auto"
      >
        {messages.length === 0 && (
          <Text color="gray.500">
            This is the beginning of #
            {party?.topics.find((topic) => topic._id === topicId)?.name}
          </Text>
        )}
        {messages.map((message) => (
          <MessageItem key={message._id} message={message} />
        ))}
      </Stack>
      <CreateMessageForm topicName={topic?.name} />
    </Box>
  );
};
