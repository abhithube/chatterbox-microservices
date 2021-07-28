import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { AuthUserDto } from './dto/auth-user.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RequestWithUser } from './interfaces/request-with-user.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async loginHandler(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const { user, accessToken, refreshToken } =
      await this.authService.authenticateUser(req.user);

    res.cookie('refresh', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    return {
      user,
      accessToken,
    };
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google')
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async googleAuthHandler(): Promise<void> {}

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleAuthCallbackHandler(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const { refreshToken } = await this.authService.authenticateUser(req.user);

    res.cookie('refresh', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    res.redirect(this.configService.get('CLIENT_URL'));
  }

  @UseGuards(GithubAuthGuard)
  @Get('github')
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async githubAuthHandler(): Promise<void> {}

  @UseGuards(GithubAuthGuard)
  @Get('github/callback')
  async githubAuthCallbackHandler(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const { refreshToken } = await this.authService.authenticateUser(req.user);

    res.cookie('refresh', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    res.redirect(this.configService.get('CLIENT_URL'));
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async authHandler(@Req() req: RequestWithUser): Promise<AuthUserDto> {
    return req.user;
  }

  @Get('confirm')
  async confirmEmailHandler(@Query('token') token: string): Promise<void> {
    await this.authService.confirmEmail(token);
  }

  @Get('forgot')
  async forgotPasswordHandler(@Body('email') email: string): Promise<void> {
    await this.authService.getPasswordResetLink(email);
  }

  @Get('reset')
  async resetPasswordHandler(
    @Query('token') token: string,
    @Body('password') password: string,
  ): Promise<void> {
    await this.authService.resetPassword(token, password);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokenHandler(@Req() req: Request): Promise<TokenResponseDto> {
    return this.authService.refreshAccessToken(req.cookies.refresh);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logoutHandler(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.logoutUser(req.cookies.refresh);
    res.clearCookie('refresh');
  }
}
