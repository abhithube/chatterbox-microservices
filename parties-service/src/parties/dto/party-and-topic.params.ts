import { IsUUID } from 'class-validator';

export class PartyAndTopicParams {
  @IsUUID(4, {
    message: 'id must be a valid UUID',
  })
  id: string;

  @IsUUID(4, {
    message: 'topicId must be a valid UUID',
  })
  topicId: string;
}
