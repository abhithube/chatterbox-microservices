import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users';
import { PartiesController } from './parties.controller';
import { PartiesService } from './parties.service';
import { Party, PartySchema } from './schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Party.name,
        schema: PartySchema,
      },
    ]),
    UsersModule,
  ],
  controllers: [PartiesController],
  providers: [PartiesService],
})
export class PartiesModule {}
