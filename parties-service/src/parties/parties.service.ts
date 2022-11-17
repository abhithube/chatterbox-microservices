import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UsersService } from '@users';
import { randomUUID } from 'crypto';
import { Model } from 'mongoose';
import { CreatePartyDto } from './dto';
import { Party, PartyDocument } from './schemas';

@Injectable()
export class PartiesService {
  constructor(
    @InjectModel(Party.name) private partyModel: Model<PartyDocument>,
    private usersService: UsersService,
  ) {}

  async createParty({ name }: CreatePartyDto, userId: string): Promise<Party> {
    const user = await this.usersService.getUserById(userId);

    const party = new this.partyModel({
      uuid: randomUUID(),
      name,
      inviteToken: randomUUID(),
      users: [user],
    });

    return party.save();
  }
}
