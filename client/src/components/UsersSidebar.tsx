import {
  Avatar,
  AvatarBadge,
  Box,
  Heading,
  List,
  ListItem,
} from '@chakra-ui/react';
import { useSocketStore } from '../stores';
import { PartyDetails } from '../types';

type UsersSidebarProps = {
  party: PartyDetails | undefined;
};

export const UsersSidebar = ({ party }: UsersSidebarProps) => {
  const { activeUsers } = useSocketStore();

  return (
    <Box
      h="full"
      bgColor="gray.800"
      borderLeftWidth={1}
      borderLeftColor="gray.600"
    >
      <Heading pt={4} fontSize="2xl" textAlign="center">
        Users
      </Heading>
      <List mt={4} pl={4}>
        {party?.members.map((member) => (
          <ListItem key={member._id} display="flex" alignItems="center" mb={2}>
            <Avatar src={member.avatarUrl || undefined} boxSize={10}>
              <AvatarBadge
                borderWidth={2}
                boxSize={4}
                bgColor={
                  activeUsers.includes(member._id) ? 'green.400' : 'red.400'
                }
                borderColor={
                  activeUsers.includes(member._id) ? 'green.100' : 'red.100'
                }
              />
            </Avatar>
            <Box as="span" ml={4}>
              {member.username}
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
