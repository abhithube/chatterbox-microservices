import { Redirect } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';

export const HomePage = () => {
  const { auth, loading } = useAuth();

  return (
    <>
      {!loading && !auth && <Redirect to="/login" />}
      {!loading && auth && <Redirect to="/parties" />}
    </>
  );
};
