import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { PartyParams } from '../dto/party.params';
import { RequestWithUserAndParty } from '../interfaces/request-with-user-and-party.interface';
import { PartiesService } from '../parties.service';

@Injectable()
export class MemberGuard implements CanActivate {
  constructor(private partiesService: PartiesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUserAndParty>();

    const partyParams = new PartyParams();
    partyParams.id = req.params.id;

    const errors = await validate(partyParams);
    if (errors.length > 0) {
      throw new BadRequestException({
        message: errors.map((error) => Object.values(error.constraints)[0]),
      });
    }

    try {
      const party = await this.partiesService.getParty(req.params.id);

      if (!party)
        throw new NotFoundException({
          message: 'Party not found',
        });

      req.party = party;

      return !!party.users.find((user) => user.id === req.user.id);
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
