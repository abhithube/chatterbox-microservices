import {
  Avatar,
  AvatarBadge,
  Box,
  Heading,
  List,
  ListItem,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
// import { socketClient } from '../../common/socketClient';
import { selectParties } from '../parties/partiesSlice';
import { selectMessages } from './messagesSlice';

export const UserSidebar = () => {
  const { activeParty } = useAppSelector(selectParties);
  const { usersOnline } = useAppSelector(selectMessages);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!activeParty) return;

    // socketClient.on('connected_users', (users: string[]) => {
    //   dispatch(updateUsersOnline(users));
    // });

    // socketClient.emit('join_party', {
    //   party: activeParty.id,
    // });

    // return () => {
    //   socketClient.emit('leave_party');
    // };
  }, [activeParty, dispatch]);

  return (
    <Box h="full" bgColor="gray.200">
      <Heading pt={4} fontSize="2xl" textAlign="center">
        Users
      </Heading>
      <List mt={4} pl={4}>
        {activeParty?.users.map(user => (
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
                bgColor={
                  usersOnline.includes(user.id) ? 'green.400' : 'red.400'
                }
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
