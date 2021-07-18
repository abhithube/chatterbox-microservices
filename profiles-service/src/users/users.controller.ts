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
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  async createUserHandler(
    @Body() user: CreateUserDto,
  ): Promise<UserResponseDto> {
    return await this.usersService.createUser(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  meHandler(@Req() req: RequestWithUser): Promise<UserResponseDto> {
    return this.usersService.getUser(req.user.id);
  }

  @Get(':id')
  userHandler(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.getUser(id);
  }

  @Delete(':id')
  deleteUserHandler(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.deleteUser(id);
  }
}
