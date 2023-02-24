import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from '@parties-service/users';
import mongoose, { HydratedDocument } from 'mongoose';
import { Topic } from './topic.schema';

export type PartyDocument = HydratedDocument<Party>;

@Schema()
export class Party {
  @Prop()
  name: string;

  @Prop({
    unique: true,
  })
  inviteToken: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }] })
  topics: Topic[];

  @Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } })
  admin: User;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  members: User[];
}

export const PartySchema = SchemaFactory.createForClass(Party);
