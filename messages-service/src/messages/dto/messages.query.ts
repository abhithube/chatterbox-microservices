import { Transform } from 'class-transformer';
import { IsHexadecimal, IsNumber, IsOptional, Length } from 'class-validator';

export class MessagesQuery {
  @IsHexadecimal({
    message: 'topicId must be a valid hex string',
  })
  @Length(24, 24, {
    message: 'topicId must be a valid BSON ObjectId',
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
