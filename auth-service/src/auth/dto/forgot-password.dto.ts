import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail(
    {},
    {
      message: 'email must be a valid email address',
    },
  )
  email: string;
}
