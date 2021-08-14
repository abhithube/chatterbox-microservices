import { Redirect } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useParty } from '../hooks/useParty';

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
