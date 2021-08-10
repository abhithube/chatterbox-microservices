import { Flex, Spinner } from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { PartiesSidebar } from '../components/PartiesSidebar';
import { PartyPanel } from '../components/PartyPanel';
import { useAuth } from '../lib/useAuth';
import { Party } from '../types';

export const PartiesPage = () => {
  const { auth } = useAuth();

  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;

    (async () => {
      setLoading(true);

      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/parties/@me`
        );

        setParties(data);
      } catch (err) {
        console.log(err.response);
      } finally {
        setLoading(false);
      }
    })();
  }, [auth, setParties]);

  const addParty = (party: Party) => {
    setParties(prev => [...prev, party]);
  };

  return (
    <>
      {loading && <Spinner />}
      {!loading && (
        <Flex boxSize="full">
          <PartiesSidebar parties={parties} addParty={addParty} />
          {parties.length > 0 && <PartyPanel />}
        </Flex>
      )}
    </>
  );
};
