import { Box, Container, HStack, Icon, Link } from '@chakra-ui/react';
import axios from 'axios';
import { FaReplyAll } from 'react-icons/fa';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { useAuth } from './useAuth';

export const Navbar = () => {
  const { auth, loading, signOut } = useAuth();

  const history = useHistory();

  const handleClick = async () => {
    await axios.post(
      `${process.env.REACT_APP_SERVER_URL}/auth/logout`,
      {},
      { withCredentials: true }
    );

    signOut();

    history.push('/login?logout=true');
  };

  return (
    <Box h="12" bgColor="teal.500" color="gray.50">
      <Container maxW="80%" h="full">
        <HStack w="full" h="full" justify="space-between">
          <Box>
            <Link as={RouterLink} to="/" _hover={{}}>
              <Box as="span" fontSize="2xl">
                chatterbox
              </Box>
              <Icon as={FaReplyAll} ml="3" boxSize="8" />
            </Link>
          </Box>
          <HStack spacing="4">
            {!loading && auth && (
              <>
                <Link as={RouterLink} to="/profile" _hover={{}}>
                  Profile
                </Link>
                <Link as="button" onClick={handleClick} _hover={{}}>
                  Logout
                </Link>
              </>
            )}
            {!loading && !auth && (
              <>
                <Link as={RouterLink} to="/login" _hover={{}}>
                  Join
                </Link>
              </>
            )}
          </HStack>
        </HStack>
      </Container>
    </Box>
  );
};
