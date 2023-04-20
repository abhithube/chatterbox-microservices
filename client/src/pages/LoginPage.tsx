import { Box, useToast, VStack } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SocialLoginForm } from '../components';

export const LoginPage = () => {
  const toast = useToast();

  const { state } = useLocation();

  useEffect(() => {
    if (state?.logout) {
      toast({
        status: 'success',
        description: 'You have been logged out',
        isClosable: true,
      });
    }
  }, []);

  return (
    <VStack w="full" mt="10%">
      <Box w="300px">
        <SocialLoginForm />
      </Box>
    </VStack>
  );
};
