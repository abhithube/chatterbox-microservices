import { Module } from '@nestjs/common';
import { UsersModule } from '../users';
import { AuthController } from './auth.controller';
import { GithubStrategy, GoogleStrategy } from './strategies';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [GithubStrategy, GoogleStrategy],
})
export class AuthModule {}
