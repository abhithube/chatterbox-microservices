import { RequestWithUser } from '@chttrbx/jwt';
import { PartyWithUsersAndTopicsDto } from '../dto/party-with-users-and-topics.dto';

export interface RequestWithUserAndParty extends RequestWithUser {
  party: PartyWithUsersAndTopicsDto;
}
