import { Card, CardBody, CardHeader, Heading, VStack } from '@chakra-ui/react';
import { faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { SocialLoginButton } from './SocialLoginButton';

export const SocialLoginForm = () => {
  return (
    <Card>
      <CardHeader>
        <Heading color="teal.300">Sign In</Heading>
      </CardHeader>

      <CardBody>
        <VStack spacing={4} alignItems="stretch">
          <SocialLoginButton path="/auth/google" icon={faGoogle} color="red">
            Sign in with Google
          </SocialLoginButton>
          <SocialLoginButton path="/auth/github" icon={faGithub} color="gray">
            Sign in with GitHub
          </SocialLoginButton>
        </VStack>
      </CardBody>
    </Card>
  );
};
