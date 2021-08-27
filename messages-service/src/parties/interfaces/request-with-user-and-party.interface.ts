import { RequestWithUser } from '@chttrbx/jwt';
import { PartyDto } from '../dto';

export interface RequestWithUserAndParty extends RequestWithUser {
  party: PartyDto;
}
