import { Button, Icon, Text } from '@chakra-ui/react';
import { FaGithub, FaGoogle } from 'react-icons/fa';

export const SocialLogin = () => (
  <>
    <Text as="span" color="gray.600" fontWeight="bold">
      Or, choose a social account
    </Text>
    <Button
      as="a"
      href={`${process.env.REACT_APP_SERVER_URL}/auth/google`}
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
      href={`${process.env.REACT_APP_SERVER_URL}/auth/github`}
      leftIcon={<Icon as={FaGithub} />}
      w="100%"
      bgColor="gray.600"
      _hover={{ bgColor: 'gray.700' }}
      color="gray.50"
    >
      Sign in with GitHub
    </Button>
  </>
);
