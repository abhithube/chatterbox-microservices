import {
  Avatar,
  AvatarBadge,
  Box,
  Heading,
  List,
  ListItem,
} from '@chakra-ui/react';
import { useAppSelector } from '../../app/hooks';
import { selectParties } from '../parties';
import { selectMessages } from './messagesSlice';

export const UserSidebar = () => {
  const { activeParty } = useAppSelector(selectParties);
  const { usersOnline } = useAppSelector(selectMessages);

  return (
    <Box h="full" bgColor="gray.200">
      <Heading pt={4} fontSize="2xl" textAlign="center">
        Users
      </Heading>
      <List mt={4} pl={4}>
        {activeParty?.members.map((member) => (
          <ListItem
            key={member.id}
            display="flex"
            alignItems="center"
            mb={2}
            w="75%"
          >
            <Avatar src={member.avatarUrl || undefined}>
              <AvatarBadge
                boxSize={5}
                bgColor={
                  usersOnline.includes(member.id) ? 'green.400' : 'red.400'
                }
              />
            </Avatar>
            <Box as="span" ml={2}>
              {member.username}
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
