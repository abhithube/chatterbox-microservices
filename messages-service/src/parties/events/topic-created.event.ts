import { TopicDto } from '../dto/topic.dto';

export class TopicCreatedEvent {
  type: 'TOPIC_CREATED';
  data: TopicDto;
}
