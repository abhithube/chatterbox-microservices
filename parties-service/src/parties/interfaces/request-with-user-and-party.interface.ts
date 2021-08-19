import { RequestWithUser } from '@chttrbx/jwt';
import { PartyDto } from '../dto/party.dto';

export interface RequestWithUserAndParty extends RequestWithUser {
  party: PartyDto;
}
