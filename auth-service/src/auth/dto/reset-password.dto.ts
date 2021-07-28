import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @IsString({
    message: 'password must be a string',
  })
  @IsNotEmpty({
    message: 'password cannot be empty',
  })
  password: string;
}
