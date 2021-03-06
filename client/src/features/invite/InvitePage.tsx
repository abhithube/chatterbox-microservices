import { Button, ButtonGroup, Center, Spinner, Text } from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { selectAuth } from '../auth';

export const InvitePage = () => {
  const { user } = useAppSelector(selectAuth);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const history = useHistory();
  const location = useLocation();

  const query = new URLSearchParams(location.search);

  const partyId = query.get('party');
  const token = query.get('token');

  useEffect(() => {
    if (!user || !partyId || !token) return;

    (async () => {
      try {
        setLoading(true);

        const res = await axios.post(
          `/messages-service/parties/${partyId}/join`,
          {
            token,
          }
        );

        if (res.status !== 200) setError(true);
        else {
          history.push(`/parties/${partyId}`, {
            joined: true,
          });
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, history, partyId, token]);

  return (
    <Center h="100%">
      {loading && <Spinner />}
      {!loading && error && (
        <>
          <Text>There was an error joining the requested party.</Text>
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
