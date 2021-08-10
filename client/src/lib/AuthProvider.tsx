import axios from 'axios';
import { createContext, PropsWithChildren, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { User } from '../types';

type AuthContextType = {
  auth: User | null;
  signIn: (auth: User, accessToken: string) => void;
  signOut: () => void;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export const AuthProvider = ({ children }: PropsWithChildren<{}>) => {
  const [auth, setAuth] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const history = useHistory();

  const signIn = (auth: User, accessToken: string) => {
    localStorage.setItem('token', accessToken);
    setAuth(auth);
  };

  const signOut = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_SERVER_URL}/auth/logout`, {});

      localStorage.removeItem('token');
      setAuth(null);
    } catch (err) {
      console.log(err.response);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);

      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/auth/@me`
        );

        setAuth(data);
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
