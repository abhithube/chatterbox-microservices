import {
  Avatar,
  AvatarBadge,
  Box,
  Heading,
  List,
  ListItem,
} from '@chakra-ui/react';
import { useParty } from '../lib/useParty';

export const UserSidebar = () => {
  const { party, online } = useParty();

  return (
    <Box h="full" w={64} bgColor="gray.700">
      <Heading pt={4} fontSize="2xl" textAlign="center" color="gray.50">
        Users
      </Heading>
      <List mt={4} pl={4}>
        {online &&
          party?.users.map(user => (
            <ListItem
              key={user.id}
              display="flex"
              alignItems="center"
              mb={2}
              w="75%"
            >
              <Avatar src={user.avatarUrl}>
                <AvatarBadge
                  boxSize={5}
                  bgColor={online.includes(user.id) ? 'green.400' : 'red.400'}
                />
              </Avatar>
              <Box as="span" ml={2} color="gray.50">
                {user.username}
              </Box>
            </ListItem>
          ))}
      </List>
    </Box>
  );
};
