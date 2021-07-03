import { Box, ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { AuthProvider } from './lib/AuthProvider';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';

export const App = () => (
  <Box h="100vh">
    <BrowserRouter>
      <AuthProvider>
        <ChakraProvider>
          <Switch>
            <Route exact path="/" component={HomePage} />
            <Route path="/login" component={LoginPage} />
          </Switch>
        </ChakraProvider>
      </AuthProvider>
    </BrowserRouter>
  </Box>
);
