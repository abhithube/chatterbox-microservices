import { MailService } from '@chttrbx/mail';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserCreatedEvent } from './events';

@Injectable()
export class UserService {
  constructor(
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  async sendEmailVerificationLink({
    username,
    email,
    verificationToken,
  }: UserCreatedEvent): Promise<void> {
    this.mailService.send({
      to: email,
      subject: 'Email Verification',
      html: `
        <p>Hello ${username},</p>
        <p>Confirm your email address <a href="${this.configService.get(
          'CLIENT_URL',
        )}/confirm?token=${verificationToken}">here</a>.</p>
      `,
    });
  }

  async sendPasswordResetLink({
    username,
    email,
    resetToken,
  }: UserCreatedEvent): Promise<void> {
    this.mailService.send({
      to: email,
      subject: 'Password Reset',
      html: `
      <p>Hello ${username},</p>
      <p>Reset your password <a href="${this.configService.get(
        'CLIENT_URL',
      )}/reset?token=${resetToken}">here.</p>
      `,
    });
  }
}
