import { Redirect, Route } from 'react-router-dom';
import { useAuth } from './useAuth';

type ProtectedRouteProps = {
  exact?: boolean;
  path: string;
  component: React.ComponentType;
};

export const ProtectedRoute = ({
  exact = false,
  path,
  component,
}: ProtectedRouteProps) => {
  const { auth, loading } = useAuth();

  return loading ? null : auth ? (
    <Route exact={exact} path={path} component={component} />
  ) : (
    <Redirect to="/login" />
  );
};
