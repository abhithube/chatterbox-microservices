import { Injectable } from '@nestjs/common';
import { PartyService } from '../parties/party.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private partyService: PartyService,
    private userRepository: UserRepository,
  ) {}

  async createUser({ id, username, avatarUrl }: CreateUserDto): Promise<void> {
    await this.userRepository.createUser(id);

    await this.partyService.createParty(
      { name: 'default' },
      { id, username, avatarUrl },
    );
  }

  async getUser(id: string): Promise<UserDto> {
    const user = await this.userRepository.getUser({
      id,
    });

    return {
      id: user.id,
    };
  }

  async deleteUser(id: string): Promise<void> {
    await this.userRepository.deleteUser({
      id,
    });

    const parties = await this.partyService.getUserParties(id);

    for (const party of parties) {
      await this.partyService.leaveParty(party, id);
    }
  }
}
