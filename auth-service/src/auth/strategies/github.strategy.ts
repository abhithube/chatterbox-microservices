import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { AuthService } from '../auth.service';
import { AuthUserDto } from '../dto/auth-user.dto';
import { GithubProfile } from '../interfaces/github-profile.interface';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get('GITHUB_CLIENT_ID'),
      clientSecret: configService.get('GITHUB_CLIENT_SECRET'),
      callbackURL: `${configService.get('BACKEND_URL')}/auth/github/callback`,
      scope: ['user:email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: GithubProfile,
  ): Promise<AuthUserDto> {
    return this.authService.validateOAuth(
      profile.username,
      profile.emails[0].value,
      profile.photos[0].value,
    );
  }
}
