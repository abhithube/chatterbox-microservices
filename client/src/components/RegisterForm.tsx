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

export const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const history = useHistory();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    (async () => {
      try {
        await axios.post(
          `${process.env.REACT_APP_PROFILES_SERVICE_URL}/api/users`,
          {
            username,
            email,
            password,
          }
        );

        history.push('/login');
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
      <FormControl id="email">
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter your email..."
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
      <FormControl id="password-confirm">
        <FormLabel>Confirm Password</FormLabel>
        <Input
          type="password"
          value={passwordConfirm}
          onChange={e => setPasswordConfirm(e.target.value)}
          placeholder="Re-enter your password..."
        />
      </FormControl>
      <Button
        type="submit"
        disabled={
          !username ||
          !email ||
          !password ||
          !passwordConfirm ||
          password !== passwordConfirm
        }
      >
        Sign up
      </Button>
    </VStack>
  );
};
