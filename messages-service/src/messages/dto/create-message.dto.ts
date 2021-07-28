import { IsHexadecimal, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateMessageDto {
  @IsString({
    message: 'body must be a string',
  })
  @IsNotEmpty({
    message: 'body cannot be empty',
  })
  body: string;

  @IsHexadecimal({
    message: 'topicId must be a valid hex string',
  })
  @Length(24, 24, {
    message: 'topicId must be a valid BSON ObjectId',
  })
  topicId: string;
}
