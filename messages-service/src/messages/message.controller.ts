import { AuthUser, JwtAuthGuard, User } from '@chttrbx/jwt';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MessageDto } from './dto/message.dto';
import { MessagesQuery } from './dto/messages.query';
import { MessageService } from './message.service';

@Controller('messages')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async messagesHandler(
    @User() { id }: AuthUser,
    @Query() { topicId, syncId }: MessagesQuery,
  ): Promise<MessageDto[]> {
    return this.messageService.getMessages(topicId, id, syncId);
  }
}
