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
import { useHistory } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { Alert, AlertMessage } from '../../common/components/Alert';
import { createTopic } from './partiesSlice';

type TopicModalProps = {
  count: number;
};

export const TopicModal = ({ count }: TopicModalProps) => {
  const dispatch = useAppDispatch();

  const [name, setName] = useState('');

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertMessage | null>(null);

  const inputRef = useRef(null);

  const history = useHistory();
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
      setLoading(true);

      dispatch(createTopic({ name }));

      setName('');
      setAlert(null);
      onClose();
    } catch (err) {
      console.log(err.response);

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 400) {
          setAlert({
            status: 'error',
            text: err.response.data.message,
          });
        }
      } else history.push('/error');
    } finally {
      setLoading(false);
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
              {alert && <Alert status={alert.status}>{alert.text}</Alert>}
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
              <Button
                type="submit"
                colorScheme="teal"
                isLoading={loading}
                loadingText="Loading..."
              >
                Submit
              </Button>
            </ModalFooter>
          </Box>
        </ModalContent>
      </Modal>
    </>
  );
};
