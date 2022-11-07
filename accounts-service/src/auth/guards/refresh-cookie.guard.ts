import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayloadDto } from '../dto';

@Injectable()
export class RefreshCookieGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest() as Request;
    const refreshToken = request.cookies.refresh;

    try {
      const { sub, exp } = this.jwtService.verify(refreshToken);

      const auth: JwtPayloadDto = {
        sub,
        exp,
      };
      request.user = auth;

      return true;
    } catch (error) {
      return false;
    }
  }
}
