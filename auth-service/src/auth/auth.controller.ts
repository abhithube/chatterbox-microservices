import { AuthUser, Cookies, JwtAuthGuard, User } from '@chttrbx/jwt';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('register')
  async registerHandler(
    @Body() createUserDto: CreateUserDto,
  ): Promise<AuthUser> {
    return this.authService.registerUser(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async loginHandler(
    @User() authUser: AuthUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const { user, accessToken, refreshToken } =
      await this.authService.authenticateUser(authUser);

    res.cookie('refresh', refreshToken, {
      httpOnly: true,
      sameSite:
        this.configService.get('NODE_ENV') === 'production' ? 'none' : true,
      secure: this.configService.get('NODE_ENV') === 'production',
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
    @User() authUser: AuthUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const { refreshToken } = await this.authService.authenticateUser(authUser);

    res.cookie('refresh', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: this.configService.get('NODE_ENV') === 'production',
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
    @User() authUser: AuthUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const { refreshToken } = await this.authService.authenticateUser(authUser);

    res.cookie('refresh', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: this.configService.get('NODE_ENV') === 'production',
    });

    res.redirect(this.configService.get('CLIENT_URL'));
  }

  @UseGuards(JwtAuthGuard)
  @Get('@me')
  async authHandler(@User() authUser: AuthUser): Promise<AuthUser> {
    return authUser;
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  async confirmEmailHandler(@Body() { token }: ConfirmEmailDto): Promise<void> {
    return this.authService.confirmEmail(token);
  }

  @Post('forgot')
  @HttpCode(HttpStatus.OK)
  async forgotPasswordHandler(
    @Body() { email }: ForgotPasswordDto,
  ): Promise<void> {
    return this.authService.getPasswordResetLink(email);
  }

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  async resetPasswordHandler(
    @Body() { token, password }: ResetPasswordDto,
  ): Promise<void> {
    return this.authService.resetPassword(token, password);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokenHandler(
    @Cookies('refresh') refresh: string,
  ): Promise<TokenResponseDto> {
    console.log(refresh);

    return this.authService.refreshAccessToken(refresh);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logoutHandler(
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    res.clearCookie('refresh');
  }

  @UseGuards(JwtAuthGuard)
  @Delete('@me')
  @HttpCode(HttpStatus.OK)
  async deleteHandler(
    @User() { id }: AuthUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.deleteUser(id);
    res.clearCookie('refresh');
  }
}
