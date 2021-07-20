import { Flex } from '@chakra-ui/react';
import { Redirect } from 'react-router-dom';
import { MessageFeed } from '../components/MessageFeed';
import { PartySidebar } from '../components/PartySidebar';
import { TopicSidebar } from '../components/TopicSidebar';
import { UserSidebar } from '../components/UserSidebar';
import { useAuth } from '../lib/useAuth';

export const HomePage = () => {
  const { auth, loading } = useAuth();

  return (
    <Flex h="full" w="full">
      {!loading && !auth && <Redirect to="/login" />}
      <PartySidebar />
      <TopicSidebar />
      <MessageFeed />
      <UserSidebar />
    </Flex>
  );
};
