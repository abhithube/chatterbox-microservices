import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString({
    message: 'body must be a string',
  })
  @IsNotEmpty({
    message: 'body cannot be empty',
  })
  body: string;
}
