import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTopicDto {
  @IsString({
    message: 'name must be a string',
  })
  @MinLength(1, {
    message: 'name cannot be empty',
  })
  @MaxLength(50, {
    message: 'name cannot exceed 50 characters',
  })
  name: string;
}
