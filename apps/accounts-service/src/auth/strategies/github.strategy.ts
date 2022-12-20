import { CreateUserDto, UsersService } from '@accounts-service/users';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private usersService: UsersService,
    configService: ConfigService,
  ) {
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
    done: any,
  ): Promise<any> {
    const email = profile.emails[0].value;

    let user = await this.usersService.findOneByEmail(email);
    if (!user) {
      const createUserDto: CreateUserDto = {
        username: profile.displayName,
        email,
        avatarUrl: profile.photos[0].value,
      };

      user = await this.usersService.createUser(createUserDto);
    }

    done(null, user);
  }
}
