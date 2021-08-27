import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsUUID } from 'class-validator';

export class MessagesQuery {
  @IsUUID(4, {
    message: 'topicId must be a valid UUID',
  })
  topicId: string;

  @IsOptional()
  @IsNumber(
    {},
    {
      message: 'syncId must be a number',
    },
  )
  @Transform(({ value }) => parseInt(value))
  syncId: number;
}
