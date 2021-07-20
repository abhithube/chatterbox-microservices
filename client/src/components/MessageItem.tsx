import { Avatar, Box, Flex, Text } from '@chakra-ui/react';
import { Message } from '../types';

type MessageProps = {
  message: Message;
};

export const MessageItem = ({ message }: MessageProps) => {
  return (
    <Flex>
      <Avatar src={message.user.avatarUrl} />
      <Box ml={4} color="gray.50">
        <Box>
          <Box as="span" fontWeight="bold">
            {message.user.username}
          </Box>
          <Box as="span" ml={2} color="gray.400" fontWeight="light">
            {message.createdAt}
          </Box>
        </Box>
        <Text>{message.body}</Text>
      </Box>
    </Flex>
  );
};
