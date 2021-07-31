import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtAsyncOptions } from './interfaces';
import { JwtService } from './jwt.service';
import { JwtStrategy } from './strategies';

@Module({})
export class JwtModule {
  static registerAsync(options: JwtAsyncOptions): DynamicModule {
    return {
      module: JwtModule,
      imports: [PassportModule],
      providers: [
        {
          provide: 'JWT_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        JwtStrategy,
        JwtService,
      ],
      exports: [JwtService],
    };
  }
}
