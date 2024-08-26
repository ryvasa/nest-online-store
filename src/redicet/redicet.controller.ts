import { Controller, Get } from '@nestjs/common';
import { RedicetService } from './redicet.service';

@Controller('redirect')
export class RedicetController {
  constructor(private readonly redicetService: RedicetService) {}
  @Get('success')
  success() {
    return { message: 'succes' };
  }

  @Get('error')
  error() {
    return { message: 'error' };
  }

  @Get('unfinish')
  unfinish() {
    return { message: 'unfinish' };
  }
}
