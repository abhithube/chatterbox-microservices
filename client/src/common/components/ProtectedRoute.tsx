import { Spinner } from '@chakra-ui/react';
import { Redirect, Route } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { selectAuth } from '../../features/login/authSlice';

type ProtectedRouteProps = {
  exact?: boolean;
  path: string;
  inverted?: boolean;
  component: React.ComponentType;
};

export const ProtectedRoute = ({
  exact = false,
  path,
  component,
  inverted = false,
}: ProtectedRouteProps) => {
  const { user, isLoading } = useAppSelector(selectAuth);

  if (isLoading) return <Spinner />;

  return user || inverted ? (
    <Route exact={exact} path={path} component={component} />
  ) : (
    <Redirect to="/login" />
  );
};
