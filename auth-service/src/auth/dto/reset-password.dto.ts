import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ResetPasswordDto {
  @IsUUID(4, {
    message: 'token must be a valid UUID',
  })
  token: string;

  @IsString({
    message: 'password must be a string',
  })
  @IsNotEmpty({
    message: 'password cannot be empty',
  })
  password: string;
}
