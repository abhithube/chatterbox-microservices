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
import { useEffect, useState } from 'react';
import { FaLock, FaUser } from 'react-icons/fa';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { Alert, AlertMessage } from '../../common/components/Alert';
import { signIn } from './authSlice';
import { LoginPageState } from './LoginPage';

type LoginFormProps = {
  state?: LoginPageState;
};

export const LoginForm = ({ state }: LoginFormProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertMessage | null>(null);

  const history = useHistory();

  useEffect(() => {
    if (state?.registered) {
      setAlert({
        status: 'success',
        text: 'Check your inbox for a verification link',
      });
    } else if (state?.verified) {
      setAlert({
        status: 'success',
        text: 'Your email has been verified',
      });
    } else if (state?.logout) {
      setAlert({
        status: 'success',
        text: 'You have been logged out',
      });
    } else if (state?.reset) {
      setAlert({
        status: 'success',
        text: 'Your password has been reset',
      });
    }
  }, [state]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    (async () => {
      try {
        setLoading(true);

        await dispatch(signIn({ username, password })).unwrap();
        history.push('/');
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
        colorScheme="teal"
        isLoading={loading}
        loadingText="Loading..."
        mt={4}
        w="100%"
      >
        Sign in
      </Button>
    </Box>
  );
};
