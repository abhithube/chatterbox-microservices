import { Injectable } from '@nestjs/common';
import { hashSync } from 'bcrypt';
import { randomUUID } from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    private mailService: MailService,
    private prisma: PrismaService,
  ) {}

  async saveUser({
    id,
    username,
    email,
    password,
    avatarUrl,
  }: UserDto): Promise<void> {
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

      await this.mailService.sendMail({
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
