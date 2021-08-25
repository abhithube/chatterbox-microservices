import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTopicDto {
  @IsString({
    message: 'name must be a string',
  })
  @IsNotEmpty({
    message: 'name cannot be empty',
  })
  @MaxLength(50, {
    message: 'name cannot exceed 50 characters',
  })
  name: string;
}
