import { useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectAuth } from '../../features/login/authSlice';
import { getParties, selectParties } from '../../features/parties/partiesSlice';

export const HomePage = () => {
  const { user, isLoading: userLoading } = useAppSelector(selectAuth);
  const { data: parties, isLoading: partiesLoading } =
    useAppSelector(selectParties);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (user) dispatch(getParties());
  }, [user, dispatch]);

  return (
    <>
      {!userLoading && !user && <Redirect to="/login" />}
      {!partiesLoading && (
        <Redirect
          to={`/parties/${parties[0].id}/topics/${parties[0].topics[0].id}`}
        />
      )}
    </>
  );
};
