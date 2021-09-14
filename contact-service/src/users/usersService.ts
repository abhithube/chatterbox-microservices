import { ConfigManager } from '@chttrbx/common';
import { MailTransport } from '../common';
import { UserDto } from './interfaces';

export interface UsersService {
  sendEmailVerificationLink(userDto: UserDto): Promise<void>;
  sendPasswordResetLink(userDto: UserDto): Promise<void>;
}

interface UsersServiceDeps {
  mailTransport: MailTransport;
  configManager: ConfigManager;
}

export function createUsersService({
  mailTransport,
  configManager,
}: UsersServiceDeps): UsersService {
  async function sendEmailVerificationLink({
    username,
    email,
    verified,
    verificationToken,
  }: UserDto): Promise<void> {
    if (!verified) {
      mailTransport.send({
        to: email,
        subject: 'Email Verification',
        content: `
          <p>Hello ${username},</p>
          <p>Confirm your email address <a href="${configManager.get(
            'CLIENT_URL'
          )}/confirm?token=${verificationToken}">here</a>.</p>
        `,
      });
    }
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
      <p>Reset your password <a href="${configManager.get(
        'CLIENT_URL'
      )}/reset?token=${resetToken}">here.</p>
      `,
    });
  }

  return {
    sendEmailVerificationLink,
    sendPasswordResetLink,
  };
}
