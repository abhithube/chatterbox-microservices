import axios from 'axios';
import { createContext, PropsWithChildren, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

type Auth = {
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  accessToken: string;
} | null;

type AuthContextType = {
  auth: Auth;
  signIn: (auth: Auth) => void;
  signOut: () => void;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  auth: null,
  signIn: () => {},
  signOut: () => {},
  loading: true,
});

export const AuthProvider = ({ children }: PropsWithChildren<{}>) => {
  const [auth, setAuth] = useState<Auth>(null);
  const [loading, setLoading] = useState(true);

  const history = useHistory();

  const signIn = (auth: Auth) => {
    setAuth(auth);
  };

  const signOut = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );

      setAuth(null);
    } catch (err) {
      console.log(err.response);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);

      let accessToken;
      try {
        const res = await axios.post(
          `${process.env.REACT_APP_SERVER_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        accessToken = res.data.accessToken;
      } catch (err) {
        console.log(err.response);

        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/auth`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        setAuth({ user: res.data, accessToken });
      } catch (err) {
        console.log(err.response);

        setAuth(null);
      }

      setLoading(false);
    })();
  }, [history]);

  return (
    <AuthContext.Provider value={{ auth, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
