import { createContext, PropsWithChildren, useCallback, useState } from 'react';
import { Topic } from '../../types';

type TopicContextType = {
  topic: Topic | null;
  selectTopic: (topic: Topic) => void;
};

export const TopicContext = createContext<TopicContextType>(
  {} as TopicContextType
);

export const TopicProvider = ({ children }: PropsWithChildren<{}>) => {
  const [topic, setTopic] = useState<Topic | null>(null);

  const selectTopic = useCallback(async (selected: Topic) => {
    setTopic(selected);
  }, []);

  return (
    <TopicContext.Provider value={{ topic, selectTopic }}>
      {children}
    </TopicContext.Provider>
  );
};
