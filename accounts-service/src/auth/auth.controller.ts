import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from 'src/common/decorators/user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@Controller('/auth')
export class AuthController {
  @Get('/github')
  @UseGuards(GithubAuthGuard)
  githubAuth(): void {}

  @Get('/github/callback')
  @UseGuards(GithubAuthGuard)
  async githubAuthCallback(@User() user: CreateUserDto): Promise<void> {
    console.log(user);
  }

  @Get('/google')
  @UseGuards(GoogleAuthGuard)
  googleAuth(): void {}

  @Get('/google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@User() user: CreateUserDto): Promise<void> {
    console.log(user);
  }
}
