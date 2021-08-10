import {
  Box,
  Button,
  Flex,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useParty } from '../lib/useParty';

export const InviteModal = () => {
  const { party } = useParty();

  const [link, setLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (!party) return;

    setLink(
      `${process.env.REACT_APP_CLIENT_URL}/invite?party=${party.id}&token=${party.inviteToken}`
    );
  }, [party]);

  const handleClick = async () => {
    await navigator.clipboard.writeText(link);
    setIsCopied(true);
  };

  return (
    <>
      <Button
        leftIcon={<Icon as={FaPlus} />}
        onClick={onOpen}
        colorScheme="teal"
      >
        Invite
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        returnFocusOnClose={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bgColor="teal.400">
            <Box as="span" color="gray.50">
              INVITE FRIENDS TO{' '}
            </Box>
            <Box as="span" color="teal.700">
              {party?.name.toUpperCase()}
            </Box>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mt={4}>
              Share the link below to allow others to join your party!
            </Text>
            <Flex align="center" my={4} p={3} bgColor="gray.100" rounded="lg">
              <Text overflowX="auto" whiteSpace="nowrap">
                {link}
              </Text>
              <Button colorScheme="teal" onClick={handleClick} ml={4} px={6}>
                {isCopied ? 'Copied' : 'Copy'}
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
