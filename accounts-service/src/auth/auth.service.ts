import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users';
import { TokenDataDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  authenticateUser({ uuid }: User): TokenDataDto {
    const accessToken = this.jwtService.sign(
      {},
      {
        subject: uuid,
        expiresIn: '15m',
      }
    );
    const refreshToken = this.jwtService.sign(
      {},
      {
        subject: uuid,
        expiresIn: '1d',
      }
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  refreshAccessToken(subject: string): string {
    return this.jwtService.sign(
      {},
      {
        subject,
        expiresIn: '15m',
      }
    );
  }
}
