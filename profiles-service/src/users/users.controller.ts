import { AuthUser, JwtAuthGuard } from '@chttrbx/jwt';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from './decorators/user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import { UserParams } from './dto/user.params';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  async createUserHandler(@Body() user: CreateUserDto): Promise<UserDto> {
    return await this.usersService.createUser(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('@me')
  meHandler(@User() user: AuthUser): Promise<UserDto> {
    return this.usersService.getUser(user.id);
  }

  @Get(':id')
  userHandler(@Param() { id }: UserParams): Promise<UserDto> {
    return this.usersService.getUser(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('@me')
  deleteUserHandler(@User() user: AuthUser): Promise<UserDto> {
    return this.usersService.deleteUser(user.id);
  }
}
