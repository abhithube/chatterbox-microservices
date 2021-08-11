import { Button, ButtonGroup, Center, Spinner, Text } from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';

export const InvitePage = () => {
  const { auth } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const history = useHistory();
  const location = useLocation();

  const query = new URLSearchParams(location.search);

  const partyId = query.get('party');
  const token = query.get('token');

  useEffect(() => {
    if (!auth || !partyId || !token) return;

    (async () => {
      try {
        setLoading(true);

        const res = await axios.post(
          `${process.env.REACT_APP_SERVER_URL}/parties/${partyId}/join`,
          {
            token,
          }
        );

        if (res.status !== 200) setError(true);
        else setError(false);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [auth, history, partyId, token]);

  return (
    <Center h="100%">
      {loading && <Spinner />}
      {!loading && error && (
        <>
          <Text>
            There was an error joining the requested party. Please verify your
            invite link.
          </Text>
          <Button
            colorScheme="red"
            variant="outline"
            onClick={() => history.replace('/dashboard')}
          >
            Return to Dashboard
          </Button>
        </>
      )}
      {!loading && !error && (
        <>
          <Text>Successfully joined party.</Text>
          <ButtonGroup>
            <Button
              colorScheme="red"
              variant="outline"
              onClick={() => history.replace('/dashboard')}
            >
              Return to Dashboard
            </Button>
            <Button
              colorScheme="teal"
              onClick={() => history.push(`/parties/${partyId}`)}
            >
              Go to Party
            </Button>
          </ButtonGroup>
        </>
      )}
    </Center>
  );
};
