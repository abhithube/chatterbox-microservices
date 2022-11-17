import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from '@users';
import mongoose, { HydratedDocument } from 'mongoose';

export type PartyDocument = HydratedDocument<Party>;

@Schema()
export class Party {
  @Prop({
    unique: true,
  })
  uuid: string;

  @Prop()
  name: string;

  @Prop({
    unique: true,
  })
  inviteToken: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  users: User[];
}

export const PartySchema = SchemaFactory.createForClass(Party);
