import {
  Box,
  Flex,
  FormControl,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
} from '@chakra-ui/react';
import { useState } from 'react';
import { FaComment, FaPlay } from 'react-icons/fa';
import { useSocket } from '../../common/hooks/useSocket';
import { useTopic } from '../../common/hooks/useTopic';

type CreateMessageProps = {
  isReady: boolean;
  setIsReady: React.Dispatch<React.SetStateAction<boolean>>;
};

export const CreateMessage = ({ isReady, setIsReady }: CreateMessageProps) => {
  const { socket } = useSocket();
  const { topic } = useTopic();

  const [message, setMessage] = useState('');

  const handleClick = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsReady(false);

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
          <FormControl id="message" isRequired>
            <InputGroup>
              <InputLeftElement
                children={<Icon as={FaComment} color="gray.300" />}
                pointerEvents="none"
              />
              <Input
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={`Message #${topic!.name}`}
              />
            </InputGroup>
          </FormControl>
          <IconButton
            aria-label="create-message-button"
            icon={<Icon as={FaPlay} />}
            isLoading={!isReady}
            spinner={<Spinner />}
            colorScheme="teal"
            type="submit"
            ml={4}
            w={16}
          />
        </Flex>
      )}
    </Box>
  );
};
