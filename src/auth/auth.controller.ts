import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginAuthDto } from './dto/login-auth.dto';
import { LocalAuthGuard } from 'src/common/guards/local-auth.guard';
import { JWTAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  LoginResponse,
  MessageResponse,
  RefreshResponse,
  RequestWithCredential,
  RequestWithGoogleCredential,
} from '../common/models/auth.model';
import { GoogleAuthGuard } from '../common/guards/google-auth.guard';
import { UserInterceptor } from '../common/interceptors/user.interceptor';
import { User } from '../users/entities/user.entity';
@ApiTags('auth')
@UseInterceptors(UserInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login user.' })
  @ApiResponse({ status: 200, description: 'Login User.', type: LoginResponse })
  login(@Body() loginAuthDto: LoginAuthDto, @Req() req: RequestWithCredential) {
    return this.authService.login(req.user);
  }

  @UseGuards(JWTAuthGuard)
  @Get('refresh')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh Token.' })
  @ApiResponse({
    status: 200,
    description: 'Refresh Token.',
    type: RefreshResponse,
  })
  refereshToken(@Req() req: RequestWithCredential) {
    return this.authService.refreshToken(req.user);
  }

  @UseGuards(JWTAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Current User.',
    type: LoginResponse,
  })
  @ApiOperation({ summary: 'Get Current User' })
  async me(@Req() request: RequestWithCredential) {
    return this.authService.me(request.user.id);
  }

  @UseGuards(JWTAuthGuard)
  @Delete('logout')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Logout success.',
    type: MessageResponse,
  })
  @ApiOperation({ summary: 'User Logout' })
  async logout(@Req() request: RequestWithCredential): Promise<object> {
    return this.authService.logout(request.user.id);
  }

  @UseGuards(GoogleAuthGuard)
  @Get('login/google')
  @ApiResponse({ status: 200, description: 'Login with google success.' })
  async google(@Req() request: RequestWithCredential): Promise<User> {
    return request.user;
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/redirect')
  @ApiResponse({ status: 200, description: 'Login with google success.' })
  async coba(@Req() request: RequestWithGoogleCredential): Promise<any> {
    return this.authService.googleAuth(request.user);
  }
}
