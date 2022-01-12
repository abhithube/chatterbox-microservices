import { Alert, Center, Flex, Heading } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertMessage } from '../../common';
import { SocialLogin } from './SocialLogin';

export type LoginPageState = {
  registered?: boolean;
  verified?: boolean;
  reset?: boolean;
  logout?: boolean;
};

export const LoginPage = () => {
  const [alert, setAlert] = useState<AlertMessage | null>(null);

  const location = useLocation<LoginPageState>();

  useEffect(() => {
    if (location.state?.logout) {
      setAlert({
        status: 'success',
        text: 'You have been logged out',
      });
    }
  }, [location.state]);

  return (
    <Center h="100%">
      <Flex direction="column" alignItems="center" w="360px">
        {alert && <Alert status={alert.status}>{alert.text}</Alert>}
        <Heading as="h1" color="teal.400">
          Sign In
        </Heading>
        <SocialLogin />
      </Flex>
    </Center>
  );
};
