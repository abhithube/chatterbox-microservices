import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RequestWithUserAndParty } from '../interfaces/request-with-user.interface';
import { PartiesService } from '../parties.service';

@Injectable()
export class MemberGuard implements CanActivate {
  constructor(private partiesService: PartiesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUserAndParty>();

    try {
      const party = await this.partiesService.getParty(req.params.id);

      req.party = party;

      return !!party.users.find((user) => user.id === req.user.id);
    } catch (err) {
      return false;
    }
  }
}
