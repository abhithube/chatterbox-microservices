import { Auth, JwtAuthGuard, JwtPayloadDto } from '@lib/auth';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserDocument } from './schemas';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('@me')
  @UseGuards(JwtAuthGuard)
  async fetchUser(@Auth() payload: JwtPayloadDto): Promise<UserDocument> {
    return this.usersService.findOneById(payload.sub);
  }
}
