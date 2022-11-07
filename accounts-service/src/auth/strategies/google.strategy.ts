import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
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
    done: VerifyCallback
  ): Promise<any> {
    const user = {
      username: profile.displayName,
      email: profile.emails[0].value,
      avatarUrl: profile.photos[0].value,
    };

    done(null, user);
  }
}
