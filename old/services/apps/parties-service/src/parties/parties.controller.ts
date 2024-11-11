import { Auth, JwtAuthGuard, JwtPayloadDto } from '@lib/auth';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreatePartyDto, CreateTopicDto } from './dto';
import { PartiesService } from './parties.service';
import { PartyDocument, TopicDocument } from './schemas';

@Controller('parties')
export class PartiesController {
  constructor(private partiesService: PartiesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createParty(
    @Auth() payload: JwtPayloadDto,
    @Body() createPartyDto: CreatePartyDto,
  ): Promise<PartyDocument> {
    return this.partiesService.createParty(createPartyDto, payload.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('@me')
  async fetchUserParties(
    @Auth() payload: JwtPayloadDto,
  ): Promise<PartyDocument[]> {
    return this.partiesService.getPartiesByUserId(payload.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async fetchParty(@Param('id') id: string): Promise<PartyDocument> {
    return this.partiesService.getPartyById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/members')
  joinParty(
    @Param('id') partyId: string,
    @Query('token') token: string,
    @Auth() payload: JwtPayloadDto,
  ) {
    return this.partiesService.createMember(partyId, payload.sub, token);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/members')
  leaveParty(@Param('id') partyId: string, @Auth() payload: JwtPayloadDto) {
    return this.partiesService.deleteMember(partyId, payload.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/topics')
  async createTopic(
    @Param('id') partyId: string,
    @Body() createTopicDto: CreateTopicDto,
  ): Promise<TopicDocument> {
    return this.partiesService.createTopic(createTopicDto, partyId);
  }
}
