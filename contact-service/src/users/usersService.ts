import { MailTransport } from '../shared';
import { UserDto } from './lib';

export interface UsersService {
  sendEmailVerificationLink(userDto: UserDto): Promise<void>;
  sendPasswordResetLink(userDto: UserDto): Promise<void>;
}

interface UsersServiceDeps {
  mailTransport: MailTransport;
}

export function createUsersService({
  mailTransport,
}: UsersServiceDeps): UsersService {
  async function sendEmailVerificationLink({
    username,
    email,
    verificationToken,
  }: UserDto): Promise<void> {
    mailTransport.send({
      to: email,
      subject: 'Email Verification',
      content: `
        <p>Hello ${username},</p>
        <p>Confirm your email address <a href="${process.env.CLIENT_URL}/confirm?token=${verificationToken}">here</a>.</p>
      `,
    });
  }

  async function sendPasswordResetLink({
    username,
    email,
    resetToken,
  }: UserDto): Promise<void> {
    mailTransport.send({
      to: email,
      subject: 'Password Reset',
      content: `
      <p>Hello ${username},</p>
      <p>Reset your password <a href="${process.env.CLIENT_URL}/reset?token=${resetToken}">here.</p>
      `,
    });
  }

  return {
    sendEmailVerificationLink,
    sendPasswordResetLink,
  };
}
