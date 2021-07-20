import { Box, ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { AuthProvider } from './lib/AuthProvider';
import { Navbar } from './lib/Navbar';
import { PartyProvider } from './lib/PartyProvider';
import { SocketProvider } from './lib/SocketProvider';
import { TopicProvider } from './lib/TopicProvider';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundErrorPage } from './pages/NotFoundErrorPage';
import { RegisterPage } from './pages/RegisterPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ServerErrorPage } from './pages/ServerErrorPage';

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
