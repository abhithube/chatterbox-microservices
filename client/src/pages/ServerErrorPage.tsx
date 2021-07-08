import { Center, Heading, Text, VStack } from '@chakra-ui/react';

export const ServerErrorPage = () => (
  <Center h="100%">
    <VStack>
      <Heading as="h1">500 Internal Server Error</Heading>
      <Text as="span">Oops, something went wrong.</Text>
    </VStack>
  </Center>
);
