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
import { useState } from 'react';
import { FaComment, FaPlay } from 'react-icons/fa';
import { selectMessages, setMessageReady } from '.';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectParties } from '../parties';
import { sendMessage } from './messagesSlice';

export const CreateMessage = () => {
  const { activeTopic } = useAppSelector(selectParties);
  const { messageReady } = useAppSelector(selectMessages);
  const dispatch = useAppDispatch();

  const [message, setMessage] = useState('');

  const handleClick = async (e: React.FormEvent) => {
    e.preventDefault();

    dispatch(setMessageReady(false));
    dispatch(
      sendMessage({
        body: message,
      })
    );

    setMessage('');
  };

  return (
    <Box as="form" onSubmit={handleClick} w="full">
      {activeTopic && (
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
                placeholder={`Message #${activeTopic!.name}`}
              />
            </InputGroup>
          </FormControl>
          <IconButton
            aria-label="create-message-button"
            icon={<Icon as={FaPlay} />}
            colorScheme="teal"
            disabled={!messageReady}
            type="submit"
            ml={4}
            w={16}
          />
        </Flex>
      )}
    </Box>
  );
};
