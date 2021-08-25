import { Injectable } from '@nestjs/common';
import { PartyRepository } from 'src/parties/party.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private partyRepository: PartyRepository,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<void> {
    await this.userRepository.createUser(createUserDto);

    this.partyRepository.createParty(
      { name: 'My Party' },
      {
        id: createUserDto.id,
        username: createUserDto.username,
        avatarUrl: createUserDto.avatarUrl,
      },
    );
  }

  async deleteUser(id: string): Promise<void> {
    this.userRepository.deleteUser({
      id,
    });

    const parties = await this.partyRepository.getParties({
      userId: id,
    });

    for (const party of parties) {
      await this.partyRepository.removeUserFromParty(party, id);
    }
  }
}
