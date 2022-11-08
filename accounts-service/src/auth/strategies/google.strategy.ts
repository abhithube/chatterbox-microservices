import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { randomUUID } from 'crypto';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { CreateUserDto, UsersService } from '../../users';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private usersService: UsersService,
    configService: ConfigService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: `${configService.get('BASE_URL')}/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _: string,
    __: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const email = profile.emails[0].value;

    let user = await this.usersService.findOneByEmail(email);
    if (!user) {
      const createUserDto: CreateUserDto = {
        uuid: randomUUID(),
        username: profile.displayName,
        email,
        avatarUrl: profile.photos[0].value,
      };

      user = await this.usersService.createUser(createUserDto);
    }

    done(null, user);
  }
}
