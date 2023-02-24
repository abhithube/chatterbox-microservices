import { UserDocument } from '@accounts-service/users';
import { Auth, JwtAuthGuard, JwtPayloadDto } from '@lib/auth';
import {
  Controller,
  Get,
  HttpCode,
  Post,
  Redirect,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Response } from 'express';
import { AuthService } from './auth.service';
import { RefreshResponseDto } from './dto';
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
  @Redirect()
  githubAuthCallback(
    @Res({ passthrough: true }) res: Response,
    @Auth() user: UserDocument,
  ) {
    const { accessToken, refreshToken } =
      this.authService.authenticateUser(user);

    res.cookie('refresh', refreshToken, this.cookieOptions);
    this.redirectUrl.hash = accessToken;

    return { url: this.redirectUrl.href };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @Redirect()
  googleAuthCallback(
    @Res({ passthrough: true }) res: Response,
    @Auth() user: UserDocument,
  ) {
    const { accessToken, refreshToken } =
      this.authService.authenticateUser(user);

    res.cookie('refresh', refreshToken, this.cookieOptions);
    this.redirectUrl.hash = accessToken;

    return { url: this.redirectUrl.href };
  }

  @Get('@me')
  @UseGuards(JwtAuthGuard)
  getAuth(@Auth() auth: JwtPayloadDto): JwtPayloadDto {
    return auth;
  }

  @Post('refresh')
  @UseGuards(RefreshCookieGuard)
  @HttpCode(200)
  refreshToken(@Auth() auth: JwtPayloadDto): RefreshResponseDto {
    const token = this.authService.refreshAccessToken(auth.sub);

    return { token };
  }

  @Post('logout')
  @UseGuards(RefreshCookieGuard)
  logout(@Res() res: Response) {
    res.clearCookie('refresh').status(200).send();
  }
}
