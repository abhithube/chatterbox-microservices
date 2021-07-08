import { Box, Center, Flex, Heading, Text } from '@chakra-ui/react';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';

export const ForgotPasswordPage = () => (
  <Center h="100%">
    <Flex direction="column" w="400px">
      <Heading as="h1" color="teal.400">
        Forgot Password
      </Heading>
      <Text mt={2} fontWeight="bold">
        A password reset link will be sent to your email.
      </Text>
      <Box mt={4}>
        <ForgotPasswordForm />
      </Box>
    </Flex>
  </Center>
);
