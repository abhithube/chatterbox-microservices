import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto';
import { User, UserDocument } from './schemas';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject('KAFKA_CLIENT') private client: ClientKafka
  ) {}

  async findOneById(uuid: string): Promise<User | null> {
    return this.userModel.findOne({ uuid }).exec();
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = new this.userModel(createUserDto);
    await user.save();

    this.client.emit('users', {
      key: user.uuid,
      value: {
        event: 'user:created',
        data: user,
      },
    });

    return user;
  }
}
