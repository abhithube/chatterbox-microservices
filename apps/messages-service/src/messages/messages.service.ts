import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async createMessage(
    body: string,
    topicId: string,
    userId: string,
  ): Promise<Message> {
    const message = new this.messageModel({
      body,
      user: userId,
      topicId,
      createdAt: new Date(),
    });

    await message.save();

    return message.populate('user');
  }

  async getMessages(topicId: string): Promise<Message[]> {
    return this.messageModel
      .find({ topicId })
      .limit(10)
      .sort({ createdAt: 'desc' })
      .populate('user')
      .exec();
  }
}
