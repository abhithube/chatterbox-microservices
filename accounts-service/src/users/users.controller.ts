import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtPayloadDto } from '../auth';
import { Auth, JwtAuthGuard } from '../common';
import { User } from './schemas';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('@me')
  @UseGuards(JwtAuthGuard)
  async fetchUser(@Auth() payload: JwtPayloadDto): Promise<User> {
    return this.usersService.findOneById(payload.sub);
  }
}
