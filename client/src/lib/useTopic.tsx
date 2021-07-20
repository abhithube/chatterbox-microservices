import { useContext } from 'react';
import { TopicContext } from './TopicProvider';

export const useTopic = () => useContext(TopicContext);
