import { UserDocument } from '@accounts-service/users';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenDataDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  authenticateUser({ id }: UserDocument): TokenDataDto {
    const accessToken = this.jwtService.sign(
      {},
      { subject: id, expiresIn: '15m' },
    );
    const refreshToken = this.jwtService.sign(
      {},
      { subject: id, expiresIn: '1d' },
    );

    return { accessToken, refreshToken };
  }

  refreshAccessToken(subject: string): string {
    return this.jwtService.sign({}, { subject, expiresIn: '15m' });
  }
}
