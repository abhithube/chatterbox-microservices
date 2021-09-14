import { Box, Button, Spinner, Stack, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectParties } from '../parties';
import { CreateMessage } from './CreateMessage';
import { MessageItem } from './MessageItem';
import { clearMessages, getMessages, selectMessages } from './messagesSlice';

export const MessageFeed = () => {
  const { activeTopic } = useAppSelector(selectParties);
  const { data: messages, isLoading } = useAppSelector(selectMessages);

  const dispatch = useAppDispatch();

  const [isReady, setIsReady] = useState(true);

  useEffect(() => {
    if (!activeTopic) return;

    dispatch(clearMessages());
    dispatch(getMessages({}));
  }, [activeTopic, dispatch]);

  const handleClick = () => {
    dispatch(
      getMessages({
        topicIndex: messages[messages.length - 1].topicIndex,
      })
    );
  };

  return (
    <Box h="full" p={8} bgColor="gray.50">
      <Stack
        direction="column-reverse"
        align="flex-start"
        spacing={4}
        my={8}
        h="85%"
        overflowY="auto"
      >
        {!isLoading && messages.length === 0 && (
          <Text color="gray.500">
            This is the beginning of #{activeTopic?.name}
          </Text>
        )}
        {messages.map(message => (
          <MessageItem key={message.id} message={message} />
        ))}
        {!isLoading &&
          messages.length > 0 &&
          messages[messages.length - 1].topicIndex > 1 && (
            <Button onClick={handleClick}>Load more!</Button>
          )}
        {isLoading && <Spinner color="teal.500" />}
      </Stack>
      <CreateMessage isReady={isReady} setIsReady={setIsReady} />
    </Box>
  );
};
