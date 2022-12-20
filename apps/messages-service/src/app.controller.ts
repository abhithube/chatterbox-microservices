import { Controller, Get } from '@nestjs/common';

@Controller('messages')
export class AppController {
  @Get('health')
  getHealth(): string {
    return 'OK';
  }
}
