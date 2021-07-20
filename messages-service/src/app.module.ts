import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MessagesModule } from './messages/messages.module';
import { PartiesModule } from './parties/parties.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PartiesModule,
    MessagesModule,
    UsersModule,
  ],
})
export class AppModule {}
