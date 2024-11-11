import { Avatar, Box, Flex, Text } from '@chakra-ui/react'
import { Message } from '../types'

type MessageItemProps = {
  message: Message
}

export const MessageItem = ({ message }: MessageItemProps) => {
  return (
    <Flex>
      <Avatar src={message.user.avatarUrl || undefined} />
      <Box ml={4}>
        <Box>
          <Box as="span" fontWeight="bold">
            {message.user.username}
          </Box>
          <Box as="span" ml={2} color="gray.400" fontWeight="light">
            {new Date(message.createdAt).toLocaleString()}
          </Box>
        </Box>
        <Text>{message.body}</Text>
      </Box>
    </Flex>
  )
}
