import { JwtAuthGuard, RequestWithUser } from '@chttrbx/jwt';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreatePartyDto } from './dto/create-party.dto';
import { CreateTopicDto } from './dto/create-topic.dto';
import { JoinPartyDto } from './dto/join-party.dto';
import { PartyAndTopicParams } from './dto/party-and-topic.params';
import { PartyDto } from './dto/party.dto';
import { PartyParams } from './dto/party.params';
import { TopicDto } from './dto/topic.dto';
import { MemberGuard } from './guards/member.guard';
import { RequestWithUserAndParty } from './interfaces/request-with-user-and-party.interface';
import { PartyService } from './party.service';

@Controller('parties')
export class PartyController {
  constructor(private partyService: PartyService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPartyHandler(
    @Req() req: RequestWithUser,
    @Body() createPartyDto: CreatePartyDto,
  ): Promise<PartyDto> {
    return this.partyService.createParty(createPartyDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/@me')
  async myPartiesHandler(@Req() req: RequestWithUser): Promise<PartyDto[]> {
    return this.partyService.getUserParties(req.user.id);
  }

  @UseGuards(JwtAuthGuard, MemberGuard)
  @Get(':id')
  async partyHandler(@Req() req: RequestWithUserAndParty): Promise<PartyDto> {
    return req.party;
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  @HttpCode(HttpStatus.OK)
  async joinPartyHandler(
    @Req() req: RequestWithUser,
    @Param() { id }: PartyParams,
    @Body() { token }: JoinPartyDto,
  ): Promise<void> {
    return this.partyService.joinParty(id, req.user, token);
  }

  @UseGuards(JwtAuthGuard, MemberGuard)
  @Post(':id/leave')
  @HttpCode(HttpStatus.OK)
  async leavePartyHandler(@Req() req: RequestWithUserAndParty): Promise<void> {
    return this.partyService.leaveParty(req.party, req.user.id);
  }

  @UseGuards(JwtAuthGuard, MemberGuard)
  @Delete(':id')
  async deletePartyHandler(@Req() req: RequestWithUserAndParty): Promise<void> {
    return this.partyService.deleteParty(req.party.id);
  }

  @UseGuards(JwtAuthGuard, MemberGuard)
  @Post(':id/topics')
  async createTopicHandler(
    @Req() req: RequestWithUserAndParty,
    @Body() createTopicDto: CreateTopicDto,
  ): Promise<TopicDto> {
    return this.partyService.createTopic(createTopicDto, req.party);
  }

  @UseGuards(JwtAuthGuard, MemberGuard)
  @Delete(':id/topics/:topicId')
  async deleteTopicHandler(
    @Param() { id, topicId }: PartyAndTopicParams,
  ): Promise<void> {
    return this.partyService.deleteTopic(topicId, id);
  }
}
