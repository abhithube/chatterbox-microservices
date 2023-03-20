import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMessageDto } from './dto';
import { Message, MessageDocument } from './schemas';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async createMessage(
    { body }: CreateMessageDto,
    topicId: string,
    userId: string,
  ): Promise<Message> {
    const message = new this.messageModel({
      body,
      user: userId,
      topicId,
      createdAt: new Date(),
    });

    return message.save();
  }

  async getMessages(createdAt: Date): Promise<Message[]> {
    return this.messageModel
      .find({ createdAt: { $lte: createdAt } })
      .limit(10)
      .sort({ createdAt: 'desc' })
      .populate('user')
      .exec();
  }
}
