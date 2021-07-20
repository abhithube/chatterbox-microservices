import { Flex, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useSocket } from '../lib/useSocket';
import { useTopic } from '../lib/useTopic';
import { Message } from '../types';
import { CreateMessage } from './CreateMessage';
import { MessageItem } from './MessageItem';

export const MessageFeed = () => {
  const { messages: initMessages } = useTopic();
  const { socket } = useSocket();

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => setMessages(initMessages), [initMessages]);

  useEffect(() => {
    if (!socket) return;

    socket.on('receive_message', (message: Message) => {
      setMessages(prev => {
        if (prev[prev.length - 1].syncId + 1 === message.syncId) {
          return [...prev, message];
        } else {
          return prev;
        }
      });
    });
  }, [socket]);

  return (
    <Flex
      flexGrow={1}
      direction="column"
      p={8}
      h="full"
      bgColor="gray.600"
      overflowY="scroll"
    >
      <VStack
        flexGrow={1}
        direction="column"
        justify="flex-end"
        align="stretch"
        spacing={4}
        mb={8}
      >
        {messages.map(message => (
          <MessageItem key={message.id} message={message} />
        ))}
      </VStack>
      <CreateMessage />
    </Flex>
  );
};
