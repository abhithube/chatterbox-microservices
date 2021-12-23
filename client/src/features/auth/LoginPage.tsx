import {
  Box,
  Center,
  Divider,
  Flex,
  Heading,
  Link,
  Text,
  VStack
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import { SocialLogin } from './SocialLogin';

export type LoginPageState = {
  registered?: boolean;
  verified?: boolean;
  reset?: boolean;
  logout?: boolean;
};

export const LoginPage = () => {
  const location = useLocation<LoginPageState>();

  return (
    <Center h="100%">
      <Flex direction="column" w="400px">
        <Heading as="h1" color="teal.400">
          Sign In
        </Heading>
        <Box mt={4}>
          <LoginForm state={location.state} />
        </Box>
        <Text as="span" mt={6}>
          {"Don't have an account? "}
          <Link as={RouterLink} to="/register" color="blue.500">
            Click here to sign up.
          </Link>
        </Text>
        <Center>
          <Divider my={4} borderWidth={1} w="66%" />
        </Center>
        <VStack spacing={4}>
          <SocialLogin />
        </VStack>
      </Flex>
    </Center>
  );
};
