import { AuthUserDto } from './auth-user.dto';

export class AuthResponseDto {
  user: AuthUserDto;
  accessToken: string;
}
