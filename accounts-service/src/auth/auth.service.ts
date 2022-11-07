import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users';
import { TokenDataDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  authenticateUser(user: User): TokenDataDto {
    const accessToken = this.jwtService.sign(
      {},
      {
        subject: user.uuid,
        expiresIn: '15m',
      }
    );
    const refreshToken = this.jwtService.sign(
      {},
      {
        subject: user.uuid,
        expiresIn: '1d',
      }
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
