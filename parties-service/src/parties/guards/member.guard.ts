import { RequestWithUser } from '@chttrbx/jwt';
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { PartyParams } from '../dto/party.params';
import { RequestWithUserAndParty } from '../interfaces/request-with-user-and-party.interface';
import { PartyService } from '../party.service';

@Injectable()
export class MemberGuard implements CanActivate {
  constructor(private partyService: PartyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();

    const partyParams = new PartyParams();
    partyParams.id = req.params.id;

    const errors = await validate(partyParams);
    if (errors.length > 0) {
      throw new BadRequestException({
        message: errors.map((error) => Object.values(error.constraints)[0]),
      });
    }

    try {
      const party = await this.partyService.getParty(req.params.id);
      if (!party.users.find((user) => user.id === req.user.id))
        throw new ForbiddenException({
          message: 'Not a member',
        });

      (req as RequestWithUserAndParty).party = party;

      return true;
    } catch (err) {
      if (err.status === 404) {
        throw err;
      } else {
        throw new InternalServerErrorException({
          message: 'Something went wrong',
        });
      }
    }
  }
}
