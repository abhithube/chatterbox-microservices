import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Response } from 'express';
import { User as UserDoc } from '../users';
import { AuthService } from './auth.service';
import { User } from './decorators';
import { JwtPayloadDto } from './dto';
import { GithubAuthGuard, GoogleAuthGuard, JwtAuthGuard } from './guards';

@Controller('/auth')
export class AuthController {
  private redirectUrl: URL;
  private cookieOptions: CookieOptions;

  constructor(private authService: AuthService, configService: ConfigService) {
    this.redirectUrl = new URL(`${configService.get('CLIENT_URL')}/redirect`);

    const isProduction = configService.get<string>('NODE_ENV') === 'production';
    this.cookieOptions = {
      httpOnly: true,
      sameSite: isProduction ? 'none' : true,
      secure: isProduction,
    };
  }

  @Get('/github')
  @UseGuards(GithubAuthGuard)
  githubAuth() {}

  @Get('/github/callback')
  @UseGuards(GithubAuthGuard)
  githubAuthCallback(@Res() res: Response, @User() user: UserDoc) {
    const { accessToken, refreshToken } =
      this.authService.authenticateUser(user);

    this.redirectUrl.hash = accessToken;

    res
      .cookie('refresh', refreshToken, this.cookieOptions)
      .redirect(this.redirectUrl.href);
  }

  @Get('/google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {}

  @Get('/google/callback')
  @UseGuards(GoogleAuthGuard)
  googleAuthCallback(@Res() res: Response, @User() user: UserDoc) {
    const { accessToken, refreshToken } =
      this.authService.authenticateUser(user);

    this.redirectUrl.hash = accessToken;

    res
      .cookie('refresh', refreshToken, this.cookieOptions)
      .redirect(this.redirectUrl.href);
  }

  @Get('/@me')
  @UseGuards(JwtAuthGuard)
  getAuth(@User() auth: JwtPayloadDto) {
    return auth;
  }
}
