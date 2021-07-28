import { RequestWithUser } from 'src/auth/interfaces/request-with-user.interface';
import { PartyWithUsersAndTopicsDto } from '../dto/party-with-users-and-topics.dto';

export interface RequestWithUserAndParty extends RequestWithUser {
  party: PartyWithUsersAndTopicsDto;
}
