import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
} from '@chakra-ui/react';
import axios from 'axios';
import { FormEvent, useState } from 'react';
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import { useHistory } from 'react-router-dom';
import { Alert, AlertMessage } from '../lib/Alert';

export const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertMessage | null>(null);

  const history = useHistory();

  const handleSubmit = (e: FormEvent) => {
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
        await axios.post(`${process.env.REACT_APP_SERVER_URL}/api/users`, {
          username,
          email,
          password,
        });

        history.push('/login?registered=true');
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 400) {
            if (err.response.statusText.includes('Username')) {
              setAlert({
                status: 'error',
                text: 'Username already taken',
              });
            } else if (err.response.statusText.includes('Email')) {
              setAlert({
                status: 'error',
                text: 'Email already taken',
              });
            }
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
        <FormControl id="password" isRequired>
          <FormLabel>Password</FormLabel>
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
        <FormControl id="password-confirm" isRequired>
          <FormLabel>Confirm Password</FormLabel>
          <InputGroup>
            <InputLeftElement
              children={<Icon as={FaLock} color="gray.300" />}
              pointerEvents="none"
            />
            <Input
              type="password"
              value={passwordConfirm}
              onChange={e => setPasswordConfirm(e.target.value)}
              placeholder="Re-enter the password..."
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
        Sign up
      </Button>
    </Box>
  );
};
