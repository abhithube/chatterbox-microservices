import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  IconButton,
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
  Tooltip,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import React, { useRef, useState } from 'react';
import { FaPlus, FaUserFriends } from 'react-icons/fa';
import { useHistory } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { Alert, AlertMessage } from '../../common/components/Alert';
import { createParty } from './partiesSlice';

type PartyModalProps = {
  count: number;
};

export const PartyModal = ({ count }: PartyModalProps) => {
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
        description: 'You cannot be a member of more than 10 parties',
      });
    } else onOpen();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      await dispatch(
        createParty({
          name,
        })
      ).unwrap();

      setName('');
      setAlert(null);
      onClose();
    } catch (err) {
      if (err.message) {
        setAlert({
          status: 'error',
          text: err.message,
        });
      } else history.push('/error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Tooltip label="Add a new party" placement="right">
        <IconButton
          icon={<Icon as={FaPlus} />}
          aria-label="add-party-button"
          onClick={handleClick}
          colorScheme="teal"
          variant="outline"
          w="12"
          h="12"
          mt="2"
        />
      </Tooltip>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        returnFocusOnClose={false}
        initialFocusRef={inputRef}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a New Party</ModalHeader>
          <ModalCloseButton />
          <Box as="form" onSubmit={handleSubmit}>
            <ModalBody>
              {alert && <Alert status={alert.status}>{alert.text}</Alert>}
              <Flex direction="column" mt={2}>
                <FormControl id="name">
                  <FormLabel>Party Name</FormLabel>
                  <InputGroup>
                    <InputLeftElement
                      children={<Icon as={FaUserFriends} color="gray.300" />}
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
