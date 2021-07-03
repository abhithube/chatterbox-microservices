import { Box, Center, VStack } from '@chakra-ui/react';
import { LoginForm } from '../components/LoginForm';
import { SocialLogin } from '../components/SocialLogin';

export const LoginPage = () => (
  <Center h="100%">
    <VStack>
      <LoginForm />
      <Box as="span">Or, choose a social login</Box>
      <SocialLogin />
    </VStack>
  </Center>
);
