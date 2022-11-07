import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@Controller('/auth')
export class AuthController {
  @Get('/github')
  @UseGuards(GithubAuthGuard)
  githubAuth(): void {}

  @Get('/github/callback')
  @UseGuards(GithubAuthGuard)
  async githubAuthCallback(@Request() req): Promise<void> {
    console.log(req.user);
  }

  @Get('/google')
  @UseGuards(GoogleAuthGuard)
  googleAuth(): void {}

  @Get('/google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Request() req): Promise<void> {
    console.log(req.user);
  }
}
