import {
  Avatar,
  Flex,
  Heading,
  Tab,
  TabList,
  Tabs,
  Tooltip,
} from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParty } from '../lib/useParty';
import { Party, PartyWithUsersAndTopics } from '../types';
import { PartyModal } from './PartyModal';

type PartiesSidebarProps = {
  parties: Party[];
  addParty: (party: Party) => void;
};

export const PartiesSidebar = ({ parties, addParty }: PartiesSidebarProps) => {
  const { selectParty } = useParty();

  const [id, setId] = useState(localStorage.getItem('party') || parties[0].id);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    try {
      (async () => {
        const { data } = await axios.get<PartyWithUsersAndTopics>(
          `${process.env.REACT_APP_SERVER_URL}/parties/${id}`
        );

        selectParty(data);
      })();
    } catch (err) {
      console.log(err.response);
    }
  }, [id, parties, selectParty]);

  useEffect(() => {
    if (!parties) return;

    setTabIndex(parties.findIndex(party => party.id === id));
  }, [id, parties]);

  const handleClick = (id: string) => {
    localStorage.setItem('party', id);
    setId(id);
  };

  return (
    <Flex direction="column" align="center" h="full" w={32} bgColor="gray.200">
      <Heading pt={4} fontSize="2xl" textAlign="center">
        Parties
      </Heading>
      <Tabs
        index={tabIndex}
        onChange={i => setTabIndex(i)}
        orientation="vertical"
      >
        <TabList alignItems="center" spacing="4" mt="4">
          {parties.map(party => (
            <Tab
              key={party.id}
              onClick={() => handleClick(party.id)}
              _selected={{ bgColor: 'gray.300' }}
            >
              <Tooltip label={party.name} placement="right">
                <Avatar name={party.name} />
              </Tooltip>
            </Tab>
          ))}
        </TabList>
      </Tabs>
      <PartyModal addParty={addParty} />
    </Flex>
  );
};
