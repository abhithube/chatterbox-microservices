import {
  Box,
  Center,
  Heading,
  HStack,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  VStack,
} from '@chakra-ui/react';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { PartyDetails } from '../interfaces';
import { PartyPageParams } from '../pages';
import { http } from '../utils';
import { InviteModal } from './InviteModal';
import { TopicModal } from './TopicModal';

export const TopicsSidebar = () => {
  const { partyId, topicId } = useParams<PartyPageParams>();

  const { data, isFetching } = useQuery<PartyDetails>({
    queryKey: ['parties', partyId],
    queryFn: () => http.get(`/parties/${partyId}`),
    enabled: !!partyId,
  });

  if (isFetching) return <Spinner />;

  return (
    <VStack
      h="full"
      align="start"
      bgColor="gray.800"
      borderRightWidth={1}
      borderRightColor="gray.600"
      spacing={4}
      p={4}
    >
      {data ? (
        <>
          <HStack w="full" justify="space-between">
            <Heading fontSize="2xl">{data?.name}</Heading>
            <Box>
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<FontAwesomeIcon icon={faGear} />}
                />
                <MenuList>
                  <TopicModal partyId={data._id} />
                  <InviteModal />
                  <MenuItem>Delete</MenuItem>
                </MenuList>
              </Menu>
            </Box>
          </HStack>
          <Box>
            {data.topics.map((topic) => (
              <Link
                key={topic._id}
                as={RouterLink}
                to={`/${partyId}/${topic._id}`}
                bgColor={topic._id === topicId ? 'gray.300' : 'gray.100'}
                rounded="sm"
                _hover={{}}
              >
                <HStack>
                  <Box as="span" fontSize="xl" color="teal.500">
                    #
                  </Box>
                  <Box as="span">{topic.name}</Box>
                </HStack>
              </Link>
            ))}
          </Box>
        </>
      ) : (
        <Center h="full" p={4}>
          Choose or create a new party
        </Center>
      )}
    </VStack>
  );
};
