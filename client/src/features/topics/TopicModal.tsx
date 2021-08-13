import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import { useRef, useState } from 'react';
import { FaComments, FaPlus } from 'react-icons/fa';
import { useParty } from '../../common/hooks/useParty';
import { Topic } from '../../types';

type TopicModalProps = {
  count: number;
  addTopic: (topic: Topic) => void;
};

export const TopicModal = ({ count, addTopic }: TopicModalProps) => {
  const { party } = useParty();

  const [name, setName] = useState('');

  const inputRef = useRef(null);

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleClick = () => {
    if (count >= 10) {
      toast({
        status: 'error',
        isClosable: true,
        description: 'A party cannot exceed 10 topics',
      });
    } else onOpen();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data } = await axios.post<Topic>(
        `${process.env.REACT_APP_SERVER_URL}/parties/${party!.id}/topics`,
        {
          name,
        }
      );

      setName('');
      onClose();

      addTopic(data);
    } catch (err) {
      console.log(err.response);
    }
  };

  return (
    <>
      <Button
        leftIcon={<Icon as={FaPlus} />}
        colorScheme="teal"
        variant="outline"
        onClick={handleClick}
      >
        New Topic
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        returnFocusOnClose={false}
        initialFocusRef={inputRef}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a New Topic</ModalHeader>
          <ModalCloseButton />
          <Box as="form" onSubmit={handleSubmit}>
            <ModalBody>
              <Flex direction="column" mt={2}>
                <FormControl id="name">
                  <FormLabel>Topic Name</FormLabel>
                  <InputGroup>
                    <InputLeftElement
                      children={<Icon as={FaComments} color="gray.300" />}
                      pointerEvents="none"
                    />
                    <Input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Enter a name..."
                      ref={inputRef}
                    />
                  </InputGroup>
                </FormControl>
              </Flex>
            </ModalBody>
            <ModalFooter>
              <Button type="submit" colorScheme="teal">
                Submit
              </Button>
            </ModalFooter>
          </Box>
        </ModalContent>
      </Modal>
    </>
  );
};
