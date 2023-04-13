import {
  Box,
  Button,
  Flex,
  MenuItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PartyDetails } from '../interfaces';

export const InviteModal = () => {
  const { partyId } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const queryClient = useQueryClient();

  const [party, setParty] = useState<PartyDetails>();
  const [link, setLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const handleOpen = () => {
    const party = queryClient.getQueryData<PartyDetails>(['parties', partyId]);
    if (!party) return;

    setParty(party);
    setLink(
      `${import.meta.env.VITE_FRONTEND_URL}/invite?party=${party._id}&token=${
        party.inviteToken
      }`,
    );

    onOpen();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link);

    setIsCopied(true);
  };

  return (
    <MenuItem icon={<FontAwesomeIcon icon={faEnvelope} />} onClick={handleOpen}>
      Invite Friend
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        returnFocusOnClose={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bgColor="teal.300">
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
            <Flex align="center" my={4} p={3} bgColor="gray.800" rounded="lg">
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
    </MenuItem>
  );
};
