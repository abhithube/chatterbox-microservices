import { Box, ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import {
  HomePage,
  Navbar,
  NotFoundErrorPage,
  ProtectedRoute,
  ServerErrorPage,
} from '../common';
import {
  ConfirmPage,
  ForgotPasswordPage,
  RegisterPage,
  ResetPasswordPage,
} from '../features/accounts';
import { LoginPage } from '../features/auth';
import { InvitePage } from '../features/invite';
import { PartyPage } from '../features/parties';

export const App = () => (
  <Box h="100vh">
    <BrowserRouter>
      <ChakraProvider>
        <Navbar />
        <Box h="calc(100% - 48px)">
          <Switch>
            <Route exact path="/" component={HomePage} />
            <ProtectedRoute
              path="/parties/:partyId/topics/:topicId"
              component={PartyPage}
            />
            <ProtectedRoute path="/invite" component={InvitePage} />
            <ProtectedRoute
              path="/register"
              inverted
              component={RegisterPage}
            />
            <ProtectedRoute path="/login" inverted component={LoginPage} />
            <ProtectedRoute path="/confirm" inverted component={ConfirmPage} />
            <ProtectedRoute
              path="/forgot"
              inverted
              component={ForgotPasswordPage}
            />
            <ProtectedRoute
              path="/reset"
              inverted
              component={ResetPasswordPage}
            />
            <Route path="/error" component={ServerErrorPage} />
            <Route path="*" component={NotFoundErrorPage} />
          </Switch>
        </Box>
      </ChakraProvider>
    </BrowserRouter>
  </Box>
);
