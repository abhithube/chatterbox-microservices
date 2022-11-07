import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get('GITHUB_CLIENT_ID'),
      clientSecret: configService.get('GITHUB_CLIENT_SECRET'),
      callbackURL: `${configService.get('BASE_URL')}/auth/github/callback`,
      scope: ['user:email'],
    });
  }

  async validate(
    _: string,
    __: string,
    profile: Profile,
    done: Function
  ): Promise<any> {
    const user = {
      username: profile.displayName,
      email: profile.emails[0].value,
      avatarUrl: profile.photos[0].value,
    };

    done(null, user);
  }
}
