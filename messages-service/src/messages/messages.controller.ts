import { AuthUser, JwtAuthGuard, User } from '@chttrbx/jwt';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MessageDto } from './dto/message.dto';
import { MessagesQuery } from './dto/messages.query';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async messagesHandler(
    @User() { id }: AuthUser,
    @Query() { topicId, syncId }: MessagesQuery,
  ): Promise<MessageDto[]> {
    return this.messagesService.getMessages(topicId, id, syncId);
  }
}
