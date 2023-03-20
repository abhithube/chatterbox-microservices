import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto';
import { User, UserDocument } from './schemas';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = new this.userModel({ ...createUserDto });

    return user.save();
  }

  getUser(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }
}
