import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MessageDto } from 'src/messages/dto/message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { CreatePartyDto } from './dto/create-party.dto';
import { CreateTopicDto } from './dto/create-topic.dto';
import { PartyWithUsersAndTopicsDto } from './dto/party-with-users-and-topics.dto';
import { PartyDto } from './dto/party.dto';
import { TopicDto } from './dto/topic.dto';
import { MemberGuard } from './guards/member.guard';
import { RequestWithUserAndParty } from './interfaces/request-with-user.interface';
import { PartiesService } from './parties.service';

@Controller('parties')
export class PartiesController {
  constructor(private readonly partiesService: PartiesService) {}

  @Get()
  async partiesHandler(): Promise<PartyDto[]> {
    return this.partiesService.getAllParties();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/@me')
  async myPartiesHandler(@Req() req: RequestWithUser): Promise<PartyDto[]> {
    return this.partiesService.getUserParties(req.user.id);
  }

  @UseGuards(JwtAuthGuard, MemberGuard)
  @Get(':id')
  async partyHandler(
    @Req() req: RequestWithUserAndParty,
  ): Promise<PartyWithUsersAndTopicsDto> {
    return req.party;
  }

  @UseGuards(JwtAuthGuard, MemberGuard)
  @Get(':id/topics/:topicId/messages')
  async messagesHandler(
    @Param('topicId') topicId: string,
    @Query('syncId') syncId: number,
  ): Promise<MessageDto[]> {
    return this.partiesService.getTopicMessages(topicId, syncId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPartyHandler(
    @Req() req: RequestWithUser,
    @Body() createPartyDto: CreatePartyDto,
  ): Promise<PartyDto> {
    return this.partiesService.createParty(createPartyDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, MemberGuard)
  @Post(':id/topics')
  async createTopicHandler(
    @Req() req: RequestWithUserAndParty,
    @Body() createTopicDto: CreateTopicDto,
  ): Promise<TopicDto> {
    return this.partiesService.createTopic(createTopicDto, req.party.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  @HttpCode(HttpStatus.OK)
  async joinPartyHandler(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Query('token') token: string,
  ): Promise<void> {
    this.partiesService.joinParty(id, req.user.id, token);
  }

  @UseGuards(JwtAuthGuard, MemberGuard)
  @Post(':id/leave')
  @HttpCode(HttpStatus.OK)
  async leavePartyHandler(@Req() req: RequestWithUserAndParty): Promise<void> {
    this.partiesService.leaveParty(req.party.id, req.user.id);
  }

  @UseGuards(JwtAuthGuard, MemberGuard)
  @Delete(':id')
  async deletePartyHandler(
    @Req() req: RequestWithUserAndParty,
  ): Promise<PartyDto> {
    return this.partiesService.deleteParty(req.party);
  }

  @UseGuards(JwtAuthGuard, MemberGuard)
  @Delete(':id/topics/:topicId')
  async deleteTopicHandler(
    @Param('topicId') topicId: string,
  ): Promise<TopicDto> {
    return this.partiesService.deleteTopic(topicId);
  }
}
