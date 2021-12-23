import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectAuth } from '../../features/auth';
import { CreateParty, getParties, selectParties } from '../../features/parties';

export const HomePage = () => {
  const { user, isLoading: userLoading } = useAppSelector(selectAuth);
  const { data: parties, isLoading: partiesLoading } =
    useAppSelector(selectParties);
  const dispatch = useAppDispatch();

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (user) dispatch(getParties());
  }, [user, dispatch]);

  useEffect(() => {
    if (!partiesLoading && parties.length === 0) {
      onOpen();
    }
  }, [partiesLoading, parties, onOpen]);

  return (
    <>
      {!userLoading && !user && <Redirect to="/login" />}
      {!partiesLoading && parties.length !== 0 && (
        <Redirect to={`/parties/${parties[0].id}`} />
      )}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        closeOnOverlayClick={false}
        closeOnEsc={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a New Party</ModalHeader>
          <ModalBody>
            <CreateParty onClose={onClose} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
