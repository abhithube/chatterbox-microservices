import axios from 'axios';
import { createContext, PropsWithChildren, useCallback, useState } from 'react';
import { Message, Topic } from '../types';
import { useParty } from './useParty';

type TopicContextType = {
  topic: Topic | null;
  messages: Message[];
  selectTopic: (id: string) => Promise<void>;
  loading: boolean;
};

export const TopicContext = createContext<TopicContextType>(
  {} as TopicContextType
);

export const TopicProvider = ({ children }: PropsWithChildren<{}>) => {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const { party } = useParty();

  const selectTopic = useCallback(
    async (id: string) => {
      if (!party) return;

      setLoading(true);

      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/parties/${party.id}/topics/${id}/messages`
        );

        setTopic(party.topics.find(topic => topic.id === id)!);
        setMessages(data);
      } catch (err) {
        console.log(err.response);
      } finally {
        setLoading(false);
      }
    },
    [party]
  );

  return (
    <TopicContext.Provider value={{ topic, messages, selectTopic, loading }}>
      {children}
    </TopicContext.Provider>
  );
};
