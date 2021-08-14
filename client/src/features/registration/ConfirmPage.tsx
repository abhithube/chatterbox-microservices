import { Center, Spinner, Text } from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Redirect, useHistory, useLocation } from 'react-router-dom';

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

        const res = await axios.post(
          `${process.env.REACT_APP_SERVER_URL}/auth/confirm`,
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
  }, [history, token]);

  return (
    <Center h="100%">
      {loading && <Spinner />}
      {!loading && error && (
        <Text>There was an error confirming your email.</Text>
      )}
      {!loading && !error && <Redirect to="/login?verified=true"></Redirect>}
    </Center>
  );
};
