import {
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
} from '@chakra-ui/react';
import axios from 'axios';
import { FormEvent, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';

export const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { signIn } = useAuth();

  const history = useHistory();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    (async () => {
      try {
        const res = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/auth/login`,
          {
            username,
            password,
          },
          { withCredentials: true }
        );

        signIn({ user: res.data.user, accessToken: res.data.accessToken });
        history.push('/');
      } catch (err) {
        console.log(err.response);
      }
    })();
  };

  return (
    <VStack as="form" onSubmit={handleSubmit} align="flex-start">
      <FormControl id="username">
        <FormLabel>Username</FormLabel>
        <Input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Enter your username..."
        />
      </FormControl>
      <FormControl id="password">
        <FormLabel>Password</FormLabel>
        <Input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter your password..."
        />
      </FormControl>
      <Button type="submit" disabled={!username || !password}>
        Sign in
      </Button>
    </VStack>
  );
};
