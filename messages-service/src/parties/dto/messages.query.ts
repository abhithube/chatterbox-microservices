import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class MessagesQuery {
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
