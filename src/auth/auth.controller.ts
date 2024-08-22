import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginAuthDto } from './dto/login-auth.dto';
import { LocalAuthGuard } from 'src/common/guards/local.guard';
import { JWTAuthGuard } from '../common/guards/jwt.guard';
import { RequestWithCredential } from '../common/interfaces/auth.interface';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login user.' })
  @ApiResponse({ status: 200, description: 'Login User.' })
  login(@Body() loginAuthDto: LoginAuthDto, @Req() req: RequestWithCredential) {
    return this.authService.login(req.user);
  }

  @UseGuards(JWTAuthGuard)
  @Get('refresh')
  @ApiOperation({ summary: 'Refresh Token.' })
  @ApiResponse({ status: 200, description: 'Refresh Token.' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
    required: true,
  })
  refereshToken(@Req() req: RequestWithCredential) {
    return this.authService.refreshToken(req.user);
  }

  @UseGuards(JWTAuthGuard)
  @Get('me')
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 200, description: 'Current User.' })
  @ApiOperation({ summary: 'Get Current User' })
  async me(@Req() request: RequestWithCredential) {
    return this.authService.me(request.user.id);
  }

  @UseGuards(JWTAuthGuard)
  @Delete('logout')
  @ApiResponse({ status: 200, description: 'Logout success.' })
  @ApiOperation({ summary: 'User Logout' })
  async logout(@Req() request: RequestWithCredential): Promise<string> {
    return this.authService.logout(request.user.id);
  }
}
