import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString({
    message: 'username must be a string',
  })
  @IsNotEmpty({
    message: 'username cannot be empty',
  })
  username: string;

  @IsEmail(
    {},
    {
      message: 'email must be a valid email',
    },
  )
  email: string;

  @IsString({
    message: 'password must be a string',
  })
  @IsNotEmpty({
    message: 'password cannot be empty',
  })
  password: string;
}
