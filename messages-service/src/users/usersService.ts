import { PartiesService } from '../parties';
import { UserDto } from './interfaces';
import { UsersRepository } from './repositories';

export interface UsersService {
  createUser(userDto: UserDto): Promise<void>;
  updateUser(userDto: UserDto): Promise<void>;
  deleteUser(userDto: UserDto): Promise<void>;
}

interface UsersServiceDeps {
  usersRepository: UsersRepository;
  partiesService: PartiesService;
}

export function createUsersService({
  usersRepository,
  partiesService,
}: UsersServiceDeps): UsersService {
  async function createUser({
    id,
    username,
    avatarUrl,
  }: UserDto): Promise<void> {
    await usersRepository.insertOne({
      id,
      username,
      avatarUrl,
    });
  }

  async function updateUser({
    id,
    username,
    avatarUrl,
  }: UserDto): Promise<void> {
    await usersRepository.updateOne(
      {
        id,
      },
      {
        username,
        avatarUrl,
      }
    );
  }

  async function deleteUser({ id }: UserDto): Promise<void> {
    await usersRepository.deleteOne({
      id,
    });

    const parties = await partiesService.getUserParties(id);

    const partyPromises: Promise<any>[] = [];

    parties.forEach((party) => {
      partyPromises.push(partiesService.leaveParty(party.id, id));
    });

    await Promise.all(partyPromises);
  }

  return {
    createUser,
    updateUser,
    deleteUser,
  };
}
