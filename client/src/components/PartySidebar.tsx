import {
  Avatar,
  Flex,
  Heading,
  Icon,
  IconButton,
  Tab,
  TabList,
  Tabs,
  Tooltip,
} from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useAuth } from '../lib/useAuth';
import { useParty } from '../lib/useParty';
import { useSocket } from '../lib/useSocket';
import { Party } from '../types';

export const PartySidebar = () => {
  const [parties, setParties] = useState<Party[]>([]);

  const { auth } = useAuth();
  const { party, selectParty } = useParty();
  const { socket } = useSocket();

  useEffect(() => {
    if (!auth) return;

    (async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/parties?userId=${auth.user.id}`
        );

        setParties(data);
        if (!party)
          await selectParty(localStorage.getItem('party') || data[0].id);
      } catch (err) {
        console.log(err.response);
      }
    })();

    return () => {
      socket?.disconnect();
    };
  }, [auth, party, socket, selectParty]);

  return (
    <Flex direction="column" align="center" h="full" w={32} bgColor="gray.800">
      <Heading pt={4} color="gray.50" fontSize="2xl" textAlign="center">
        Parties
      </Heading>
      <Tabs orientation="vertical">
        <TabList alignItems="center" spacing="4" mt="4">
          {parties.map(party => (
            <Tab key={party.id} onClick={() => selectParty(party.id)}>
              <Tooltip label={party.name} placement="right">
                <Avatar name={party.name} />
              </Tooltip>
            </Tab>
          ))}
        </TabList>
      </Tabs>
      <Tooltip label="Add a new party" placement="right">
        <IconButton
          icon={<Icon as={FaPlus} />}
          aria-label="add-party-button"
          colorScheme="teal"
          variant="outline"
          w="12"
          h="12"
          mt="2"
        />
      </Tooltip>
    </Flex>
  );
};
