import { AuthUser } from '@chttrbx/jwt';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { PartyRepository } from '../parties/party.repository';
import { MessageDto } from './dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageRepository } from './message.repository';

@Injectable()
export class MessageService {
  constructor(
    private messageRepository: MessageRepository,
    private partyRepository: PartyRepository,
  ) {}

  async validatePartyConnection(
    partyId: string,
    userId: string,
  ): Promise<void> {
    const party = await this.partyRepository.getParty({
      id: partyId,
      userId,
    });
    if (!party) {
      throw new WsException('Not a member');
    }
  }

  async validateTopicConnection(topicId: string): Promise<void> {
    const party = await this.partyRepository.getParty({
      topicId,
    });
    if (!party) {
      throw new WsException('Topic not found');
    }
  }

  async createMessage(
    { body }: CreateMessageDto,
    topicId: string,
    user: AuthUser,
  ): Promise<MessageDto> {
    const message = await this.messageRepository.getLatestMessage(topicId);

    return this.messageRepository.createMessage({
      topicIndex: (message?.topicIndex || 0) + 1,
      body,
      topicId,
      user,
    });
  }

  async getMessages(
    topicId: string,
    userId: string,
    topicIndex?: number,
  ): Promise<MessageDto[]> {
    const party = await this.partyRepository.getParty({
      topicId,
    });
    if (!party) {
      throw new NotFoundException({
        message: 'Topic not found',
      });
    }

    if (!party.users.find((user) => user.id === userId)) {
      throw new ForbiddenException({
        message: 'Not a member',
      });
    }

    return this.messageRepository.getMessagesByTopicId(topicId, topicIndex);
  }
}
