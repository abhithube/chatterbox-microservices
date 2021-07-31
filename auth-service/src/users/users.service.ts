import { MailService } from '@chttrbx/mail';
import { Injectable } from '@nestjs/common';
import { hashSync } from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async saveUser({
    id,
    username,
    email,
    password,
    avatarUrl,
  }: CreateUserDto): Promise<void> {
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

      await this.mailService.send({
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

  async removeUser(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: {
        sub: id,
      },
    });
  }
}
