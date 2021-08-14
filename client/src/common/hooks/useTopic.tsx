import { useContext } from 'react';
import { TopicContext } from '../providers/TopicProvider';

export const useTopic = () => useContext(TopicContext);
