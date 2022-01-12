import { Button, Icon, VStack } from '@chakra-ui/react';
import { FaGithub, FaGoogle } from 'react-icons/fa';

export const SocialLogin = () => (
  <VStack spacing={4} w="full" mt={6}>
    <Button
      as="a"
      href={`${process.env.REACT_APP_SERVER_URL}/accounts-service/auth/google`}
      leftIcon={<Icon as={FaGoogle} />}
      w="100%"
      bgColor="red.400"
      _hover={{ bgColor: 'red.500' }}
      color="gray.50"
    >
      Sign in with Google
    </Button>
    <Button
      as="a"
      href={`${process.env.REACT_APP_SERVER_URL}/accounts-service/auth/github`}
      leftIcon={<Icon as={FaGithub} />}
      w="100%"
      bgColor="gray.600"
      _hover={{ bgColor: 'gray.700' }}
      color="gray.50"
    >
      Sign in with GitHub
    </Button>
  </VStack>
);
