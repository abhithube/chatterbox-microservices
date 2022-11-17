import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Auth, JwtAuthGuard, JwtPayloadDto } from '../auth';
import { CreatePartyDto } from './dto';
import { PartiesService } from './parties.service';
import { Party } from './schemas';

@Controller('parties')
export class PartiesController {
  constructor(private partiesService: PartiesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createParty(
    @Auth() payload: JwtPayloadDto,
    @Body() createPartyDto: CreatePartyDto,
  ): Promise<Party> {
    return this.partiesService.createParty(createPartyDto, payload.sub);
  }
}
