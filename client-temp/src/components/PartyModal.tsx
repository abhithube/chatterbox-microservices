import {
  Button,
  FormControl,
  FormLabel,
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
} from '@chakra-ui/react';
import { faPlus, faUserFriends } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Party } from '../interfaces';
import { http } from '../utils';

export const PartyModal = () => {
  const [name, setName] = useState('');

  const queryClient = useQueryClient();

  const { mutateAsync, isLoading } = useMutation<Party, unknown, string>({
    mutationFn: (name) => http.post('/parties', { name }),
    onSuccess: (data) => {
      queryClient.setQueryData<Party[]>(['parties'], (prev) =>
        prev ? [...prev, data] : [data],
      );
    },
  });

  const { isOpen, onOpen, onClose } = useDisclosure();

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const party = await mutateAsync(name);

    setName('');

    onClose();
    navigate(`/${party._id}`);
  };

  return (
    <>
      <Tooltip label="Create a new party" placement="right">
        <IconButton
          icon={<FontAwesomeIcon icon={faPlus} />}
          aria-label="create-party-button"
          onClick={onOpen}
          size="lg"
          variant="outline"
          rounded="full"
          colorScheme="teal"
        />
      </Tooltip>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit}>
          <ModalHeader bg="teal.300">Create a New Party</ModalHeader>
          <ModalCloseButton />
          <ModalBody pt={4}>
            <FormControl id="name" isRequired>
              <FormLabel>Party Name</FormLabel>
              <InputGroup>
                <InputLeftElement
                  children={<FontAwesomeIcon icon={faUserFriends} />}
                  pointerEvents="none"
                />
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter a name..."
                  bgColor="gray.800"
                />
              </InputGroup>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              type="submit"
              colorScheme="teal"
              isLoading={isLoading}
              loadingText="Loading..."
            >
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
