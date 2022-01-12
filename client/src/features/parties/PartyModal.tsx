import {
  Icon,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Tooltip,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';
import { CreateParty } from './CreateParty';

type PartyModalProps = {
  count: number;
};

export const PartyModal = ({ count }: PartyModalProps) => {
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
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a New Party</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <CreateParty onClose={onClose} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
