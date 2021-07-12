import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Cache } from 'cache-manager';
import { randomBytes } from 'crypto';
import { Model } from 'mongoose';
import { lastValueFrom } from 'rxjs';
import { MailService } from 'src/mail/mail.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { AuthUserDto } from './dto/auth-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { Token } from './schemas/token.schema';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private mailService: MailService,
    private httpService: HttpService,
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async validateLocal(
    username: string,
    password: string,
  ): Promise<AuthUserDto> {
    const user = await this.userModel.findOne({ username });
    if (!user || !user.password || !bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException({ message: 'Invalid credentials' });
    if (!user.verified)
      throw new UnauthorizedException({ message: 'Email not verified' });

    this.mailService.sendMail({
      to: 'abhimanyuthube@gmail.com',
      subject: 'Email Verification',
      html: `<p>Yo, what's up.</p>`,
    });

    return {
      id: user.sub,
      username: user.username,
      avatarUrl: user.avatarUrl,
    };
  }

  async validateOAuth(
    username: string,
    email: string,
    avatarUrl: string,
  ): Promise<AuthUserDto> {
    let user = await this.userModel.findOne({ email: email });
    if (!user) {
      const res = await lastValueFrom(
        this.httpService.post(
          `${this.configService.get('SERVER_URL')}/api/users`,
          {
            username,
            email,
            avatarUrl,
          },
        ),
      );

      user = res.data;
    }

    if (!user)
      throw new InternalServerErrorException({
        message: 'Something went wrong',
      });

    return {
      id: user.sub,
      username: user.username,
      avatarUrl: user.avatarUrl,
    };
  }

  async authenticateUser({
    id,
    username,
    avatarUrl,
  }: AuthUserDto): Promise<AuthResponseDto & { refreshToken: string }> {
    const accessToken = this.jwtService.sign({
      sub: id,
      username: username,
      avatarUrl: avatarUrl,
    });
    const refreshToken = this.jwtService.sign({});

    await this.cacheManager.set<Token>(
      refreshToken,
      { userId: id },
      { ttl: 60 * 60 * 24 },
    );

    return {
      user: { id, username, avatarUrl },
      accessToken,
      refreshToken,
    };
  }

  async confirmEmail(verificationToken: string): Promise<void> {
    const user = await this.userModel.findOne({ verificationToken });
    if (!user) throw new BadRequestException('Invalid verification code');

    await this.userModel.updateOne(
      { id: user.id },
      { verified: true, verificationToken: null },
    );
  }

  async getPasswordResetLink(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('User not found');

    if (!user.verified) throw new BadRequestException('Email not verified');

    const resetToken = randomBytes(16).toString('hex');

    await this.userModel.updateOne({ id: user.id }, { resetToken });

    await this.mailService.sendMail({
      to: email,
      subject: 'Password Reset',
      html: `<p>Reset your password <a href="${this.configService.get(
        'SERVER_URL',
      )}/reset?token=${resetToken}">here</>.</p>`,
    });
  }

  async resetPassword(resetToken: string, password: string): Promise<void> {
    const user = await this.userModel.findOne({ resetToken });
    if (!user) throw new BadRequestException('Invalid verification code');

    const hashed = await bcrypt.hash(password, 10);

    await this.userModel.updateOne(
      { id: user.id },
      { password: hashed, resetToken: null },
    );
  }

  async refreshAccessToken(refreshToken: string): Promise<TokenResponseDto> {
    const token = await this.cacheManager.get<Token>(refreshToken);
    if (!token) throw new UnauthorizedException('User not authorized');

    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const user = await this.userModel.findOne({ sub: token.userId });
      if (!user) throw new UnauthorizedException('User not authorized');

      const accessToken = this.jwtService.sign({
        sub: user.sub,
        username: user.username,
        avatarUrl: user.avatarUrl,
      });

      return { accessToken };
    } catch (err) {
      throw new UnauthorizedException('User not authorized');
    }
  }

  async logoutUser(refreshToken: string): Promise<void> {
    await this.cacheManager.del(refreshToken);
  }

  async saveUser({
    id,
    username,
    email,
    password,
    avatarUrl,
  }: CreateUserDto): Promise<void> {
    if (password) {
      const user = await this.userModel.create({
        data: {
          sub: id,
          username,
          email,
          avatarUrl,
          password: bcrypt.hashSync(password, 10),
          verificationToken: randomBytes(16).toString('hex'),
        },
      });

      await this.mailService.sendMail({
        to: email,
        subject: 'Email Verification',
        html: `<p>Confirm your email address <a href="${process.env.SERVER_URL}/auth/confirm?token=${user.verificationToken}">here</>.</p>`,
      });
    } else {
      await this.userModel.create({
        sub: id,
        username,
        email,
        avatarUrl,
        verified: true,
      });
    }
  }

  async removeUser(sub: string): Promise<void> {
    await this.userModel.deleteOne({ sub });
  }
}
