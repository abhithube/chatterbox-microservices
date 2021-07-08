import { Center, Heading, Text, VStack } from '@chakra-ui/react';

export const NotFoundErrorPage = () => (
  <Center h="100%">
    <VStack>
      <Heading as="h1">404 Not Found</Heading>
      <Text as="span">Oops, we can't find the page you're looking for.</Text>
    </VStack>
  </Center>
);
