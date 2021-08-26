import { Injectable } from '@nestjs/common';
import { PartyRepository } from '../parties/party.repository';
import { UserCreatedEvent } from './events';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private partyRepository: PartyRepository,
  ) {}

  async createUser(user: UserCreatedEvent): Promise<void> {
    await this.userRepository.createUser(user);

    this.partyRepository.createParty(
      { name: 'My Party' },
      {
        id: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
    );
  }

  async deleteUser({ id }: UserCreatedEvent): Promise<void> {
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
