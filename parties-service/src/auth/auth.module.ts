import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [JwtStrategy],
})
export class AuthModule {}
