import { Box, Button, Spinner, Stack, Text } from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useAuth } from '../../common/hooks/useAuth';
import { useParty } from '../../common/hooks/useParty';
import { useSocket } from '../../common/hooks/useSocket';
import { useTopic } from '../../common/hooks/useTopic';
import { Message } from '../../types';
import { CreateMessage } from './CreateMessage';
import { MessageItem } from './MessageItem';

export const MessageFeed = () => {
  const { auth } = useAuth();
  const { socket } = useSocket();
  const { party } = useParty();
  const { topic } = useTopic();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const [isReady, setIsReady] = useState(true);

  useEffect(() => {
    if (!topic || topic.partyId !== party?.id) return;

    setMessages([]);
    setLoading(true);

    (async () => {
      try {
        const { data } = await axios.get<Message[]>(
          `${process.env.REACT_APP_SERVER_URL}/messages?topicId=${topic?.id}`
        );

        setMessages(data);
      } catch (err) {
        console.log(err.response);
      } finally {
        setLoading(false);
      }
    })();
  }, [auth, party, topic]);

  useEffect(() => {
    if (!socket) return;

    socket.on('receive_message', (message: Message) => {
      setMessages(prev => {
        if (prev.length === 0) return [message];

        if (prev[0].syncId + 1 === message.syncId) {
          return [message, ...prev];
        } else {
          return prev;
        }
      });

      setIsReady(true);
    });
  }, [socket]);

  const handleClick = async () => {
    setLoading(true);

    try {
      const { data } = await axios.get<Message[]>(
        `${process.env.REACT_APP_SERVER_URL}/parties/${party!.id}/topics/${
          topic?.id
        }/messages?syncId=${messages[messages.length - 1].syncId}`
      );

      setMessages(prev => {
        if (prev[prev.length - 1].syncId - 1 === data[0].syncId) {
          return [...prev, ...data];
        } else {
          return prev;
        }
      });
    } catch (err) {
      console.log(err.response);
    } finally {
      setLoading(false);
    }
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
        {loading && <Spinner color="teal.500" />}
        {!loading && messages.length === 0 && (
          <Text color="gray.500">This is the beginning of #{topic?.name}</Text>
        )}
        {messages.map(message => (
          <MessageItem key={message.id} message={message} />
        ))}
        {messages.length > 0 && messages[messages.length - 1].syncId > 1 && (
          <Button onClick={handleClick}>Load more!</Button>
        )}
      </Stack>
      <CreateMessage isReady={isReady} setIsReady={setIsReady} />
    </Box>
  );
};
