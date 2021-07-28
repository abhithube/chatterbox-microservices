import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString({
    message: 'password must be a string',
  })
  @MinLength(1, {
    message: 'password cannot be empty',
  })
  password: string;
}
