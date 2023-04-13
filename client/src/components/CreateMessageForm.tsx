import {
  Box,
  Flex,
  FormControl,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { faComment, faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { useSocketStore } from '../stores';

type CreateMessageFormProps = {
  topicName: string | undefined;
};

export const CreateMessageForm = ({ topicName }: CreateMessageFormProps) => {
  const { sendMessage } = useSocketStore();

  const [message, setMessage] = useState('');
  const [isLoading, setLoading] = useState(false);

  const handleClick = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    sendMessage(message);

    setMessage('');
    setLoading(false);
  };

  return (
    <Box as="form" onSubmit={handleClick} w="full">
      {topicName && (
        <Flex>
          <FormControl id="message" isRequired>
            <InputGroup>
              <InputLeftElement
                children={<FontAwesomeIcon icon={faComment} />}
                pointerEvents="none"
              />
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Message #${topicName}`}
              />
            </InputGroup>
          </FormControl>
          <IconButton
            aria-label="create-message-button"
            icon={<FontAwesomeIcon icon={faPlay} />}
            colorScheme="teal"
            isLoading={isLoading}
            disabled={isLoading}
            type="submit"
            ml={4}
            w={16}
          />
        </Flex>
      )}
    </Box>
  );
};
