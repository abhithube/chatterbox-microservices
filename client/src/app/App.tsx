import { Box, ChakraProvider } from '@chakra-ui/react';
import axios from 'axios';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { ProtectedRoute } from '../common/components/ProtectedRoute';
import { HomePage } from '../common/layout/HomePage';
import { Navbar } from '../common/layout/Navbar';
import { NotFoundErrorPage } from '../common/layout/NotFoundErrorPage';
import { ServerErrorPage } from '../common/layout/ServerErrorPage';
import { AuthProvider } from '../common/providers/AuthProvider';
import { PartyProvider } from '../common/providers/PartyProvider';
import { SocketProvider } from '../common/providers/SocketProvider';
import { TopicProvider } from '../common/providers/TopicProvider';
import { InvitePage } from '../features/invite/InvitePage';
import { LoginPage } from '../features/login/LoginPage';
import { PartyPage } from '../features/parties/PartyPage';
import { ForgotPasswordPage } from '../features/password-reset/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/password-reset/ResetPasswordPage';
import { ConfirmPage } from '../features/registration/ConfirmPage';
import { RegisterPage } from '../features/registration/RegisterPage';
import { User } from '../types';

axios.interceptors.request.use(req => {
  const token = localStorage.getItem('token');

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
    req.withCredentials = true;
  }

  return req;
});

axios.interceptors.response.use(
  res => {
    return res;
  },
  async err => {
    if (err.response.status === 401 && !err.config._retry) {
      try {
        const { data } = await axios.post<{ user: User; accessToken: string }>(
          `${process.env.REACT_APP_SERVER_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        );

        localStorage.setItem('token', data.accessToken);

        err.config._retry = true;

        return axios(err.config);
      } catch (err) {
        console.log(err.response);
      }
    }
  }
);

export const App = () => (
  <Box h="100vh">
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <PartyProvider>
            <TopicProvider>
              <ChakraProvider>
                <Navbar />
                <Box h="calc(100% - 48px)">
                  <Switch>
                    <Route exact path="/" component={HomePage} />
                    <ProtectedRoute path="/parties/:id" component={PartyPage} />
                    <ProtectedRoute path="/invite" component={InvitePage} />
                    <Route path="/register" component={RegisterPage} />
                    <Route path="/login" component={LoginPage} />
                    <Route path="/confirm" component={ConfirmPage} />
                    <Route path="/forgot" component={ForgotPasswordPage} />
                    <Route path="/reset" component={ResetPasswordPage} />
                    <Route path="/error" component={ServerErrorPage} />
                    <Route path="*" component={NotFoundErrorPage} />
                  </Switch>
                </Box>
              </ChakraProvider>
            </TopicProvider>
          </PartyProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </Box>
);
