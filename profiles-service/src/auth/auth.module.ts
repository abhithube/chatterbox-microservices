import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [ConfigModule, PassportModule],
  providers: [JwtStrategy],
  exports: [JwtStrategy],
})
export class AuthModule {}
