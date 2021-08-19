import { Box, ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { ProtectedRoute } from '../common/components/ProtectedRoute';
import { HomePage } from '../common/layout/HomePage';
import { Navbar } from '../common/layout/Navbar';
import { NotFoundErrorPage } from '../common/layout/NotFoundErrorPage';
import { ServerErrorPage } from '../common/layout/ServerErrorPage';
import { InvitePage } from '../features/invite/InvitePage';
import { LoginPage } from '../features/login/LoginPage';
import { PartyPage } from '../features/parties/PartyPage';
import { ForgotPasswordPage } from '../features/password-reset/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/password-reset/ResetPasswordPage';
import { ConfirmPage } from '../features/registration/ConfirmPage';
import { RegisterPage } from '../features/registration/RegisterPage';

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
            <Route path="/login" component={LoginPage} />
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
