import {
  Alert,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { useState } from 'react';
import { FaUserFriends } from 'react-icons/fa';
import { useHistory } from 'react-router';
import { useAppDispatch } from '../../app/hooks';
import { AlertMessage } from '../../common';
import { createParty } from './partiesSlice';

type CreatePartyProps = {
  onClose?: () => void;
};

export const CreateParty = ({ onClose }: CreatePartyProps) => {
  const dispatch = useAppDispatch();

  const [name, setName] = useState('');

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertMessage | null>(null);

  const history = useHistory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const party = await dispatch(
        createParty({
          name,
        })
      ).unwrap();

      history.push(`/parties/${party.id}`);

      setName('');
      setAlert(null);

      onClose && onClose();
    } catch (error) {
      const err = error as Error;

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
    <Box as="form" onSubmit={handleSubmit}>
      {alert && <Alert status={alert.status}>{alert.text}</Alert>}
      <Flex direction="column" mt={2} w="400px">
        <FormControl id="name" isRequired>
          <FormLabel>Party Name</FormLabel>
          <InputGroup>
            <InputLeftElement
              children={<Icon as={FaUserFriends} color="gray.300" />}
              pointerEvents="none"
            />
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a name..."
            />
          </InputGroup>
        </FormControl>
      </Flex>
      <Button
        type="submit"
        colorScheme="teal"
        isLoading={loading}
        loadingText="Loading..."
        my={8}
        w="full"
      >
        Submit
      </Button>
    </Box>
  );
};
