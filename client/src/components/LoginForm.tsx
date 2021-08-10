import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  VStack,
} from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaLock, FaUser } from 'react-icons/fa';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { Alert, AlertMessage } from '../lib/Alert';
import { useAuth } from '../lib/useAuth';
import { User } from '../types';

type LoginFormProps = {
  status: string | null;
};

export const LoginForm = ({ status }: LoginFormProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertMessage | null>(null);

  const { signIn } = useAuth();

  const history = useHistory();

  useEffect(() => {
    switch (status) {
      case 'registered':
        setAlert({
          status: 'success',
          text: 'Check your inbox for a verification link',
        });
        break;
      case 'verified':
        setAlert({ status: 'success', text: 'Your email has been verified' });
        break;
      case 'reset':
        setAlert({ status: 'success', text: 'Your password has been reset' });
        break;
      default:
        setAlert(null);
        break;
    }
  }, [status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    (async () => {
      try {
        setLoading(true);
        const { data } = await axios.post<{ user: User; accessToken: string }>(
          `${process.env.REACT_APP_SERVER_URL}/auth/login`,
          {
            username,
            password,
          },
          {
            withCredentials: true,
          }
        );

        signIn(data.user, data.accessToken);
        history.push('/');
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 400) {
            setAlert({
              status: 'error',
              text: 'Invalid credentials',
            });
            setLoading(false);
          }
        } else history.push('/error');
      }
    })();
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      {alert && <Alert status={alert.status}>{alert.text}</Alert>}
      <VStack mt={2}>
        <FormControl id="username" isRequired>
          <FormLabel>Username</FormLabel>
          <InputGroup>
            <InputLeftElement
              children={<Icon as={FaUser} color="gray.300" />}
              pointerEvents="none"
            />
            <Input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter your username..."
            />
          </InputGroup>
        </FormControl>
        <FormControl id="password" isRequired>
          <HStack align="flex-start" justify="space-between">
            <FormLabel>Password</FormLabel>
            <Link as={RouterLink} to="/forgot" color="blue.500">
              Forgot password?
            </Link>
          </HStack>
          <InputGroup>
            <InputLeftElement
              children={<Icon as={FaLock} color="gray.300" />}
              pointerEvents="none"
            />
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password..."
            />
          </InputGroup>
        </FormControl>
      </VStack>
      <Button
        type="submit"
        isLoading={loading}
        loadingText="Loading..."
        mt={4}
        w="100%"
        bgColor="teal.400"
        _hover={{ bgColor: 'teal.500' }}
        color="gray.50"
      >
        Sign in
      </Button>
    </Box>
  );
};
