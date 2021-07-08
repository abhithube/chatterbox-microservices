import { Box, Center, Flex, Heading, Link, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { RegisterForm } from '../components/RegisterForm';

export const RegisterPage = () => (
  <Center h="100%">
    <Flex direction="column" w="400px">
      <Heading as="h1" color="teal.400">
        Sign Up
      </Heading>
      <Box mt={4}>
        <RegisterForm />
      </Box>
      <Text as="span" mt={6}>
        {'Already have an account? '}
        <Link as={RouterLink} to="/login" color="blue.500">
          Click here to sign in.
        </Link>
      </Text>
    </Flex>
  </Center>
);
