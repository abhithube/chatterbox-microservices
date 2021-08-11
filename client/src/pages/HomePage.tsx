import { Redirect } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';
import { useParty } from '../lib/useParty';

export const HomePage = () => {
  const { auth, loading } = useAuth();
  const { party } = useParty();

  return (
    <>
      {!loading && !auth && <Redirect to="/login" />}
      {!loading && party && <Redirect to={`/parties/${party.id}`} />}
    </>
  );
};
