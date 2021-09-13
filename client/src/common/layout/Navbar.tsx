import { Box, Container, HStack, Icon, Link } from '@chakra-ui/react';
import { useEffect } from 'react';
import { FaReplyAll } from 'react-icons/fa';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { getAuth, selectAuth, signOut } from '../../features/auth';

export const Navbar = () => {
  const { user, isLoading } = useAppSelector(selectAuth);
  const dispatch = useAppDispatch();

  const history = useHistory();

  useEffect(() => {
    if (!user) dispatch(getAuth());
  }, [user, dispatch]);

  const handleClick = async () => {
    dispatch(signOut());

    history.push({
      pathname: '/login',
      state: {
        logout: true,
      },
    });
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
            {!isLoading && user && (
              <Link as="button" onClick={handleClick} _hover={{}}>
                Logout
              </Link>
            )}
            {!isLoading && !user && (
              <Link as={RouterLink} to="/login" _hover={{}}>
                Join
              </Link>
            )}
          </HStack>
        </HStack>
      </Container>
    </Box>
  );
};
