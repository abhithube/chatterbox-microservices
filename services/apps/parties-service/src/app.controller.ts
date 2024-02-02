import { Controller, Get } from '@nestjs/common';

@Controller('parties')
export class AppController {
  @Get('health')
  getHealth(): string {
    return 'OK';
  }
}
