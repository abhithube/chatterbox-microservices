import { Controller, Get } from '@nestjs/common';

@Controller('auth')
export class AppController {
  @Get('health')
  getHealth(): string {
    return 'OK';
  }
}
