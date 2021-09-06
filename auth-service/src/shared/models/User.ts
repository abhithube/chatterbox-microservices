import { model, Schema } from 'mongoose';

export interface UserDocument {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  password: string | null;
  verified: boolean;
  verificationToken: string | null;
  resetToken: string;
}

const userSchema = new Schema<UserDocument>({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: false,
  },
  avatarUrl: {
    type: String,
    required: false,
  },
  verified: {
    type: Boolean,
    required: true,
  },
  verificationToken: {
    type: String,
    required: false,
  },
  resetToken: {
    type: String,
    required: true,
  },
});

export const User = model('User', userSchema);
