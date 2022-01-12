import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Alert, AlertMessage, httpClient } from '../../common';

interface ResetPasswordPayload {
  token: string;
  password: string;
}

type ResetPasswordFormProps = {
  token: string;
};

export const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertMessage | null>(null);

  const history = useHistory();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      return setAlert({
        status: 'error',
        text: "Passwords don't match",
      });
    }

    (async () => {
      try {
        setLoading(true);

        await httpClient.post<ResetPasswordPayload>(
          '/accounts-service/accounts/reset',
          {
            token,
            password,
          }
        );

        history.push({
          pathname: '/login',
          state: {
            reset: true,
          },
        });
      } catch (error) {
        const err = error as Error;

        if (err.message) {
          setAlert({
            status: 'error',
            text: err.message,
          });
          setLoading(false);
        } else history.push('/error');
      }
    })();
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      {alert && <Alert status={alert.status}>{alert.text}</Alert>}
      <VStack mt={2}>
        <FormControl id="password" isRequired>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a password..."
          />
        </FormControl>
        <FormControl id="password-confirm" isRequired>
          <FormLabel>Confirm Password</FormLabel>
          <Input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="Re-enter the password..."
          />
        </FormControl>
      </VStack>
      <Button
        type="submit"
        colorScheme="teal"
        isLoading={loading}
        loadingText="Loading..."
        mt={4}
        w="100%"
      >
        Submit
      </Button>
    </Box>
  );
};
