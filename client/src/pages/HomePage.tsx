import { Box, Button, Center, VStack } from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';

export const HomePage = () => {
  const { auth, signOut, loading } = useAuth();

  const history = useHistory();

  return (
    <Center h="100%">
      {loading && <Box as="span">Loading...</Box>}
      {!loading && auth && (
        <VStack>
          <Box as="span">
            You are currently logged in as {auth.user.username}
          </Box>
          <Button onClick={signOut}>Sign out</Button>
        </VStack>
      )}
      {!loading && !auth && (
        <VStack>
          <Box as="span">You are not currently logged in</Box>
          <Button onClick={() => history.push('/login')}>Sign in</Button>
        </VStack>
      )}
    </Center>
  );
};
