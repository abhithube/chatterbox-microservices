import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { GithubStrategy } from './strategies/github.strategy';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  controllers: [AuthController],
  providers: [GithubStrategy, GoogleStrategy],
})
export class AuthModule {}
