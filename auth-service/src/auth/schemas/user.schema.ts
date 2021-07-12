import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type UserDocument = User & mongoose.Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  id: string;

  @Prop({ required: true, unique: true })
  sub: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  avatarUrl?: string;

  @Prop({ required: false })
  password?: string;

  @Prop({ required: true, default: false })
  verified: boolean;

  @Prop({ required: false, unique: true })
  verificationToken?: string;

  @Prop({ required: false, unique: true })
  resetToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
