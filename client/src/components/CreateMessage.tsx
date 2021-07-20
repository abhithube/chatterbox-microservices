import {
  Box,
  Flex,
  FormControl,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { FormEvent, useState } from 'react';
import { FaPlay, FaUser } from 'react-icons/fa';
import { useSocket } from '../lib/useSocket';
import { useTopic } from '../lib/useTopic';

export const CreateMessage = () => {
  const { socket } = useSocket();
  const { topic } = useTopic();

  const [message, setMessage] = useState('');

  const handleClick = async (e: FormEvent) => {
    e.preventDefault();

    socket!.emit('send_message', {
      body: message,
      topicId: topic!.id,
    });

    setMessage('');
  };

  return (
    <Box as="form" onSubmit={handleClick} w="full">
      {topic && (
        <Flex>
          <FormControl id="username" isRequired>
            <InputGroup>
              <InputLeftElement
                children={<Icon as={FaUser} color="gray.300" />}
                pointerEvents="none"
              />
              <Input
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={`Message ${topic!.name}...`}
                color="gray.50"
              />
            </InputGroup>
          </FormControl>
          <IconButton
            aria-label="create-message-button"
            icon={<Icon as={FaPlay} />}
            type="submit"
            w="100%"
            bgColor="teal.400"
            _hover={{ bgColor: 'teal.500' }}
            color="gray.50"
          />
        </Flex>
      )}
    </Box>
  );
};
