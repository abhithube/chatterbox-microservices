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
} from '@chakra-ui/react';
import axios from 'axios';
import React, { useState } from 'react';
import { FaPlus, FaUserFriends } from 'react-icons/fa';
import { Party } from '../types';

type PartyModalProps = {
  addParty: (party: Party) => void;
};

export const PartyModal = ({ addParty }: PartyModalProps) => {
  const [name, setName] = useState('');

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data } = await axios.post<Party>(
      `${process.env.REACT_APP_SERVER_URL}/parties`,
      {
        name,
      }
    );

    setName('');
    onClose();

    addParty(data);
  };

  return (
    <>
      <Tooltip label="Add a new party" placement="right">
        <IconButton
          icon={<Icon as={FaPlus} />}
          aria-label="add-party-button"
          onClick={onOpen}
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
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a New Party</ModalHeader>
          <ModalCloseButton />
          <Box as="form" onSubmit={handleSubmit}>
            <ModalBody>
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
