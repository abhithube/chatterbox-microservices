import {
  Avatar,
  AvatarBadge,
  Box,
  Heading,
  List,
  ListItem,
} from '@chakra-ui/react';
import { User } from '../../types';

type UserSidebarProps = {
  users: User[];
  online: string[];
};

export const UserSidebar = ({ users, online }: UserSidebarProps) => {
  return (
    <Box h="full" bgColor="gray.200">
      <Heading pt={4} fontSize="2xl" textAlign="center">
        Users
      </Heading>
      <List mt={4} pl={4}>
        {users.map(user => (
          <ListItem
            key={user.id}
            display="flex"
            alignItems="center"
            mb={2}
            w="75%"
          >
            <Avatar src={user.avatarUrl || undefined}>
              <AvatarBadge
                boxSize={5}
                bgColor={online.includes(user.id) ? 'green.400' : 'red.400'}
              />
            </Avatar>
            <Box as="span" ml={2}>
              {user.username}
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
