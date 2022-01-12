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
  useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FaUserPlus } from 'react-icons/fa';
import { useAppSelector } from '../../app/hooks';
import { selectParties } from '../parties';

export const InviteModal = () => {
  const { activeParty: party } = useAppSelector(selectParties);

  const [link, setLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (!party) return;

    setLink(
      `${process.env.REACT_APP_CLIENT_URL}/invite?party=${party.id}&token=${party.inviteToken}`
    );
  }, [party]);

  const handleClick = () => {
    if (party!.members.length >= 10) {
      toast({
        status: 'error',
        isClosable: true,
        description: 'A party cannot exceed 10 members',
      });
    } else onOpen();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link);
    setIsCopied(true);
  };

  return (
    <>
      <Button
        leftIcon={<Icon as={FaUserPlus} />}
        onClick={handleClick}
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
              <Button colorScheme="teal" onClick={handleCopy} ml={4} px={6}>
                {isCopied ? 'Copied' : 'Copy'}
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
