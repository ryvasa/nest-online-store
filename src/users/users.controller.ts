import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserInterceptor } from '../common/interceptors/user.interceptor';
import {
  MessageResponse,
  RequestWithCredential,
} from '../common/models/auth.model';
import { JWTAuthGuard } from '../common/guards/jwt-auth.guard';
import { ArrayUserResponse, UserResponse } from '../common/models/user.model';

@UseInterceptors(UserInterceptor)
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiBody({ type: CreateUserDto })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JWTAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Return all users.',
    type: ArrayUserResponse,
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JWTAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a user' })
  @ApiResponse({
    status: 200,
    description: 'Return a user.',
    type: UserResponse,
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JWTAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
  })
  @ApiBody({ type: UpdateUserDto })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: RequestWithCredential,
  ) {
    return this.usersService.update(request.user, id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JWTAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({
    status: 200,
    type: MessageResponse,
    description: 'The user has been successfully deleted.',
  })
  remove(
    @Param('id') id: string,
    @Req() request: RequestWithCredential,
  ): Promise<object> {
    return this.usersService.remove(request.user, id);
  }
}
