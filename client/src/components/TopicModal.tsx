import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  MenuItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { faComment, faComments } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PartyDetails, Topic } from '../types';
import { http } from '../utils';

export const TopicModal = () => {
  const { partyId } = useParams();

  const [name, setName] = useState('');

  const { isOpen, onOpen, onClose } = useDisclosure();
  const inputRef = useRef(null);

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<Topic, unknown, string>({
    mutationFn: (name) => http.post(`/parties/${partyId}/topics`, { name }),
    onSuccess: (data) => {
      queryClient.setQueryData<PartyDetails>(['parties', partyId], (prev) =>
        prev
          ? {
              ...prev,
              topics: [...prev?.topics, data],
            }
          : undefined
      );
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const topic = await mutateAsync(name);

    onClose();
    navigate(`/${partyId}/${topic._id}`);
  };

  return (
    <MenuItem icon={<FontAwesomeIcon icon={faComment} />} onClick={onOpen}>
      Create Topic
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        returnFocusOnClose={false}
        initialFocusRef={inputRef}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bgColor="teal.300">Create a New Topic</ModalHeader>
          <ModalCloseButton />
          <Box as="form" onSubmit={handleSubmit}>
            <ModalBody>
              <FormControl id="name">
                <FormLabel>Topic Name</FormLabel>
                <InputGroup>
                  <InputLeftElement
                    children={<FontAwesomeIcon icon={faComments} />}
                    pointerEvents="none"
                  />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter a name..."
                    ref={inputRef}
                    bgColor="gray.800"
                  />
                </InputGroup>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button
                type="submit"
                colorScheme="teal"
                isLoading={isPending}
                isDisabled={name.length === 0}
                loadingText="Loading..."
              >
                Submit
              </Button>
            </ModalFooter>
          </Box>
        </ModalContent>
      </Modal>
    </MenuItem>
  );
};
