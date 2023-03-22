import {
  Avatar,
  AvatarBadge,
  Box,
  Heading,
  List,
  ListItem,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { PartyDetails } from '../interfaces';
import { PartyPageParams } from '../pages';
import { useSocketStore } from '../stores';
import { http } from '../utils';

export const UserSidebar = () => {
  const { partyId } = useParams<PartyPageParams>();

  const { activeUsers } = useSocketStore();

  const { data } = useQuery<PartyDetails>({
    queryKey: ['parties', partyId],
    queryFn: () => http.get(`/parties/${partyId}`),
    enabled: !!partyId,
  });

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
        {data?.members.map((member) => (
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
