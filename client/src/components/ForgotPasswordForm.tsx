import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
} from '@chakra-ui/react';
import axios from 'axios';
import { useState } from 'react';
import { FaEnvelope } from 'react-icons/fa';
import { useHistory } from 'react-router-dom';
import { Alert, AlertMessage } from '../lib/Alert';

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertMessage | null>(null);

  const history = useHistory();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    (async () => {
      try {
        setLoading(true);
        await axios.post(`${process.env.REACT_APP_SERVER_URL}/auth/forgot`, {
          email,
        });

        setEmail('');
        setAlert({ status: 'success', text: 'Password reset link sent' });
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 404) {
            setAlert({
              status: 'error',
              text: 'User not found with this email address',
            });
          }
        } else history.push('/error');
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      {alert && <Alert status={alert.status}>{alert.text}</Alert>}
      <VStack mt={2}>
        <FormControl id="email" isRequired>
          <FormLabel>Email</FormLabel>
          <InputGroup>
            <InputLeftElement
              children={<Icon as={FaEnvelope} color="gray.300" />}
              pointerEvents="none"
            />
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email..."
            />
          </InputGroup>
        </FormControl>
      </VStack>
      <ButtonGroup mt={4} w="100%">
        <Button
          type="submit"
          isLoading={loading}
          loadingText="Loading..."
          w="66%"
          bgColor="teal.400"
          _hover={{ bgColor: 'teal.500' }}
          color="gray.50"
        >
          Submit
        </Button>
        <Button onClick={() => history.push('/login')} w="33%">
          Back
        </Button>
      </ButtonGroup>
    </Box>
  );
};
