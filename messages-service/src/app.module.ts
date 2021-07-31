import { JwtModule } from '@chttrbx/jwt';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MessagesModule } from './messages/messages.module';
import { PartiesModule } from './parties/parties.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secretOrKey: configService.get('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    PartiesModule,
    MessagesModule,
    UsersModule,
  ],
})
export class AppModule {}
