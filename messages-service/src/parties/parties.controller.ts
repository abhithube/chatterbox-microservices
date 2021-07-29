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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { MessageDto } from '../messages/dto/message.dto';
import { CreatePartyDto } from './dto/create-party.dto';
import { CreateTopicDto } from './dto/create-topic.dto';
import { JoinPartyQuery } from './dto/join-party.query';
import { MessagesQuery } from './dto/messages.query';
import { PartyAndTopicParams } from './dto/party-and-topic.params';
import { PartyWithUsersAndTopicsDto } from './dto/party-with-users-and-topics.dto';
import { PartyDto } from './dto/party.dto';
import { PartyParams } from './dto/party.params';
import { TopicDto } from './dto/topic.dto';
import { MemberGuard } from './guards/member.guard';
import { RequestWithUserAndParty } from './interfaces/request-with-user.interface';
import { PartiesService } from './parties.service';

@Controller('parties')
export class PartiesController {
  constructor(private readonly partiesService: PartiesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPartyHandler(
    @Req() req: RequestWithUser,
    @Body() createPartyDto: CreatePartyDto,
  ): Promise<PartyDto> {
    return this.partiesService.createParty(createPartyDto, req.user.id);
  }

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

  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  @HttpCode(HttpStatus.OK)
  async joinPartyHandler(
    @Req() req: RequestWithUser,
    @Param() { id }: PartyParams,
    @Query() { token }: JoinPartyQuery,
  ): Promise<void> {
    return this.partiesService.joinParty(id, req.user.id, token);
  }

  @UseGuards(JwtAuthGuard, MemberGuard)
  @Post(':id/leave')
  @HttpCode(HttpStatus.OK)
  async leavePartyHandler(@Req() req: RequestWithUserAndParty): Promise<void> {
    return this.partiesService.leaveParty(req.party.id, req.user.id);
  }

  @UseGuards(JwtAuthGuard, MemberGuard)
  @Delete(':id')
  async deletePartyHandler(
    @Req() req: RequestWithUserAndParty,
  ): Promise<PartyDto> {
    return this.partiesService.deleteParty(req.party);
  }

  @UseGuards(JwtAuthGuard, MemberGuard)
  @Post(':id/topics')
  async createTopicHandler(
    @Req() req: RequestWithUserAndParty,
    @Body() createTopicDto: CreateTopicDto,
  ): Promise<TopicDto> {
    return this.partiesService.createTopic(createTopicDto, req.party.id);
  }

  @UseGuards(JwtAuthGuard, MemberGuard)
  @Get(':id/topics/:topicId/messages')
  async messagesHandler(
    @Param() { topicId }: PartyAndTopicParams,
    @Query() { syncId }: MessagesQuery,
  ): Promise<MessageDto[]> {
    return this.partiesService.getTopicMessages(topicId, syncId);
  }

  @UseGuards(JwtAuthGuard, MemberGuard)
  @Delete(':id/topics/:topicId')
  async deleteTopicHandler(
    @Param() { topicId }: PartyAndTopicParams,
  ): Promise<TopicDto> {
    return this.partiesService.deleteTopic(topicId);
  }
}
