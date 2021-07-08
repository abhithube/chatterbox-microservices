import { Box, Center, Flex, Heading, Text } from '@chakra-ui/react';
import { Redirect, useLocation } from 'react-router-dom';
import { ResetPasswordForm } from '../components/ResetPasswordForm';

export const ResetPasswordPage = () => {
  const query = new URLSearchParams(useLocation().search);
  const token = query.get('token');

  return token ? (
    <Center h="100%">
      <Flex direction="column" w="400px">
        <Heading as="h1" color="teal.400">
          Reset Password
        </Heading>
        <Text mt={2} fontWeight="bold">
          Enter a new password for your user account.
        </Text>
        <Box mt={4}>
          <ResetPasswordForm token={token} />
        </Box>
      </Flex>
    </Center>
  ) : (
    <Redirect to="/login" />
  );
};
