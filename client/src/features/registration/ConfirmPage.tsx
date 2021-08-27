import { Center, Spinner, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Redirect, useHistory, useLocation } from 'react-router-dom';
import { httpClient } from '../../common/httpClient';

interface EmailConfirmationPayload {
  token: string;
}

export const ConfirmPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const history = useHistory();
  const location = useLocation();

  const query = new URLSearchParams(location.search);

  const token = query.get('token');

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        setLoading(true);

        await httpClient.post<EmailConfirmationPayload>(
          `${process.env.REACT_APP_SERVER_URL}/auth/confirm`,
          {
            token,
          }
        );

        setError(false);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [history, token]);

  return (
    <Center h="100%">
      {loading && <Spinner />}
      {!loading && error && (
        <Text>There was an error confirming your email.</Text>
      )}
      {!loading && !error && (
        <Redirect
          to={{
            pathname: '/login',
            state: {
              verified: true,
            },
          }}
        ></Redirect>
      )}
    </Center>
  );
};
