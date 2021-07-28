import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
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
  @Get('me')
  meHandler(@Req() req: RequestWithUser): Promise<UserDto> {
    return this.usersService.getUser(req.user.id);
  }

  @Get(':id')
  userHandler(@Param() { id }: UserParams): Promise<UserDto> {
    return this.usersService.getUser(id);
  }

  @Delete(':id')
  deleteUserHandler(@Param() { id }: UserParams): Promise<UserDto> {
    return this.usersService.deleteUser(id);
  }
}
