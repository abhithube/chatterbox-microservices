import { Box, ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { AuthProvider } from './lib/AuthProvider';
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
        <ChakraProvider>
          <Switch>
            <Route exact path="/" component={HomePage} />
            <Route path="/register" component={RegisterPage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/forgot" component={ForgotPasswordPage} />
            <Route path="/reset" component={ResetPasswordPage} />
            <Route path="/error" component={ServerErrorPage} />
            <Route path="*" component={NotFoundErrorPage} />
          </Switch>
        </ChakraProvider>
      </AuthProvider>
    </BrowserRouter>
  </Box>
);
