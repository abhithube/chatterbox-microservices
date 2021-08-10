import { Box, ChakraProvider } from '@chakra-ui/react';
import axios from 'axios';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { AuthProvider } from './lib/AuthProvider';
import { Navbar } from './lib/Navbar';
import { PartyProvider } from './lib/PartyProvider';
import { ProtectedRoute } from './lib/ProtectedRoute';
import { SocketProvider } from './lib/SocketProvider';
import { TopicProvider } from './lib/TopicProvider';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { HomePage } from './pages/HomePage';
import { InvitePage } from './pages/InvitePage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundErrorPage } from './pages/NotFoundErrorPage';
import { PartiesPage } from './pages/PartiesPage';
import { RegisterPage } from './pages/RegisterPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ServerErrorPage } from './pages/ServerErrorPage';
import { User } from './types';

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
                    <ProtectedRoute
                      exact
                      path="/parties"
                      component={PartiesPage}
                    />
                    <ProtectedRoute path="/invite" component={InvitePage} />
                    <Route path="/register" component={RegisterPage} />
                    <Route path="/login" component={LoginPage} />
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
