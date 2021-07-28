import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { hashSync } from 'bcrypt';
import { randomUUID } from 'crypto';
import { Transporter } from 'nodemailer';
import { EventUserDto } from './dto/event-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('SMTP_TRANSPORT') private transport: Transporter,
    private prisma: PrismaClient,
  ) {}

  async saveUser({
    id,
    username,
    email,
    password,
    avatarUrl,
  }: EventUserDto): Promise<void> {
    if (password) {
      const user = await this.prisma.user.create({
        data: {
          sub: id,
          username,
          email,
          avatarUrl,
          password: hashSync(password, 10),
          verificationToken: randomUUID(),
          resetToken: randomUUID(),
        },
      });

      await this.transport.sendMail({
        to: email,
        subject: 'Email Verification',
        html: `
          <p>Hello ${username},</p>
          <p>Confirm your email address <a href="${process.env.SERVER_URL}/auth/confirm?token=${user.verificationToken}">here</a>.</p>
        `,
      });
    } else {
      await this.prisma.user.create({
        data: {
          sub: id,
          username,
          email,
          avatarUrl,
          verified: true,
        },
      });
    }
  }

  async removeUser(sub: string): Promise<void> {
    await this.prisma.user.delete({
      where: {
        sub,
      },
    });
  }
}
