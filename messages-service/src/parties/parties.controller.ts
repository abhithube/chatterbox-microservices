import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Party } from '@prisma/client';
import { RequestWithUser } from 'src/auth/interfaces/request-with-user.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePartyDto } from './dto/create-party.dto';
import { PartiesService } from './parties.service';

@Controller('parties')
export class PartiesController {
  constructor(private readonly partiesService: PartiesService) {}

  @Get()
  async partiesHandler(): Promise<Party[]> {
    return this.partiesService.getAllParties();
  }

  @Get(':id')
  async partyHandler(@Param('id') id: number): Promise<Party> {
    return this.partiesService.getParty(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPartyHandler(
    @Req() req: RequestWithUser,
    @Body() createPartyDto: CreatePartyDto,
  ): Promise<Party> {
    return this.partiesService.createParty(createPartyDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  @HttpCode(HttpStatus.OK)
  async joinPartyHandler(
    @Req() req: RequestWithUser,
    @Param('id') id: number,
  ): Promise<Party> {
    return this.partiesService.joinParty(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/leave')
  @HttpCode(HttpStatus.OK)
  async leavePartyHandler(
    @Req() req: RequestWithUser,
    @Param('id') id: number,
  ): Promise<Party> {
    return this.partiesService.leaveParty(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePartyHandler(
    @Req() req: RequestWithUser,
    @Param('id') id: number,
  ): Promise<Party> {
    return this.partiesService.deleteParty(id, req.user.id);
  }
}
