import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Response } from 'express';
import { Auth, JwtAuthGuard } from '../common';
import { User } from '../users';
import { AuthService } from './auth.service';
import { JwtPayloadDto, RefreshResponseDto } from './dto';
import { GithubAuthGuard, GoogleAuthGuard, RefreshCookieGuard } from './guards';

@Controller('auth')
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

  @Get('github')
  @UseGuards(GithubAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  githubAuth() {}

  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  githubAuthCallback(@Res() res: Response, @Auth() user: User) {
    const { accessToken, refreshToken } =
      this.authService.authenticateUser(user);

    this.redirectUrl.hash = accessToken;

    res
      .cookie('refresh', refreshToken, this.cookieOptions)
      .redirect(this.redirectUrl.href);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleAuthCallback(@Res() res: Response, @Auth() user: User) {
    const { accessToken, refreshToken } =
      this.authService.authenticateUser(user);

    this.redirectUrl.hash = accessToken;

    res
      .cookie('refresh', refreshToken, this.cookieOptions)
      .redirect(this.redirectUrl.href);
  }

  @Get('@me')
  @UseGuards(JwtAuthGuard)
  getAuth(@Auth() auth: JwtPayloadDto): JwtPayloadDto {
    return auth;
  }

  @Get('refresh')
  @UseGuards(RefreshCookieGuard)
  refreshToken(@Auth() auth: JwtPayloadDto): RefreshResponseDto {
    const accessToken = this.authService.refreshAccessToken(auth.sub);

    return {
      accessToken,
    };
  }

  @Get('logout')
  @UseGuards(RefreshCookieGuard)
  logout(@Res() res: Response) {
    res.clearCookie('refresh').send();
  }
}
