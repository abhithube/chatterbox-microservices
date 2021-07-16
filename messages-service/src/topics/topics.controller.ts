import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Topic } from '@prisma/client';
import { RequestWithUser } from 'src/auth/interfaces/request-with-user.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTopicDto } from './dto/create-topic.dto';
import { TopicsService } from './topics.service';

@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get(':id')
  async topicHandler(@Param('id') id: number): Promise<Topic> {
    return this.topicsService.getTopic(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id')
  async createTopicHandler(
    @Req() req: RequestWithUser,
    @Body() createTopicDto: CreateTopicDto,
  ): Promise<Topic> {
    return this.topicsService.createTopic(createTopicDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteTopicHandler(
    @Req() req: RequestWithUser,
    @Param('id') id: number,
  ): Promise<Topic> {
    return this.topicsService.deleteTopic(id, req.user.id);
  }
}
