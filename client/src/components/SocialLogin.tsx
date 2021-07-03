import { Button, VStack } from '@chakra-ui/react';
import { FaGithub, FaGoogle } from 'react-icons/fa';

export const SocialLogin = () => (
  <VStack>
    <Button
      as="a"
      href={`${process.env.REACT_APP_AUTH_SERVICE_URL}/api/auth/google`}
      leftIcon={<FaGoogle />}
      bgColor="red.400"
      _hover={{ bgColor: 'red.500' }}
      color="gray.50"
    >
      Sign in with Google
    </Button>
    <Button
      as="a"
      href={`${process.env.REACT_APP_AUTH_SERVICE_URL}/api/auth/github`}
      leftIcon={<FaGithub />}
      bgColor="gray.600"
      _hover={{ bgColor: 'gray.700' }}
      color="gray.50"
    >
      Sign in with Github
    </Button>
  </VStack>
);
