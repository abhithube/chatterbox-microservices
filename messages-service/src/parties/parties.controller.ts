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
import { Party } from '@prisma/client';
import { MessageDto } from 'src/messages/dto/message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { CreatePartyDto } from './dto/create-party.dto';
import { CreateTopicDto } from './dto/create-topic.dto';
import { PartyWithUsersAndTopicsDto } from './dto/party-with-users-and-topics.dto';
import { PartyDto } from './dto/party.dto';
import { TopicDto } from './dto/topic.dto';
import { PartiesService } from './parties.service';

@Controller('parties')
export class PartiesController {
  constructor(private readonly partiesService: PartiesService) {}

  @Get()
  async partiesHandler(@Query('userId') userId: string): Promise<PartyDto[]> {
    return this.partiesService.getAllParties(userId);
  }

  @Get(':id')
  async partyHandler(
    @Param('id') id: string,
  ): Promise<PartyWithUsersAndTopicsDto> {
    return this.partiesService.getParty(id);
  }

  @Get(':id/topics/:topicId/messages')
  async messagesHandler(
    @Param('topicId') topicId: string,
    @Query('limit') limit: number,
    @Query('syncId') syncId: number,
  ): Promise<MessageDto[]> {
    return this.partiesService.getMessages(topicId, limit || 50, syncId || 1);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPartyHandler(
    @Req() req: RequestWithUser,
    @Body() createPartyDto: CreatePartyDto,
  ): Promise<PartyDto> {
    return this.partiesService.createParty(createPartyDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/topics')
  async createTopicHandler(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() createTopicDto: CreateTopicDto,
  ): Promise<TopicDto> {
    return this.partiesService.createTopic(createTopicDto, req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  @HttpCode(HttpStatus.OK)
  async joinPartyHandler(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<Party> {
    return this.partiesService.joinParty(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/leave')
  @HttpCode(HttpStatus.OK)
  async leavePartyHandler(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<Party> {
    return this.partiesService.leaveParty(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePartyHandler(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<PartyDto> {
    return this.partiesService.deleteParty(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/topics/:topicId')
  async deleteTopicHandler(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Param('topicId') topicId: string,
  ): Promise<TopicDto> {
    return this.partiesService.deleteTopic(topicId, req.user.id, id);
  }
}
