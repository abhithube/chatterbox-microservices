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
import { useState } from 'react';
import { FaEnvelope } from 'react-icons/fa';
import { useHistory } from 'react-router-dom';
import { Alert, AlertMessage, httpClient } from '../../common';

interface ForgotPasswordPayload {
  email: string;
}

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

        await httpClient.post<ForgotPasswordPayload>(
          '/accounts-service/accounts/forgot',
          {
            email,
          }
        );

        setEmail('');
        setAlert({ status: 'success', text: 'Password reset link sent' });
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
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email..."
            />
          </InputGroup>
        </FormControl>
      </VStack>
      <ButtonGroup mt={4} w="100%">
        <Button
          type="submit"
          colorScheme="teal"
          isLoading={loading}
          loadingText="Loading..."
          w="66%"
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
