import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const customHeader = request.headers['authorization'];

    if (!customHeader) {
      throw new ForbiddenException('You do not have permission');
    }
    const { id } = await this.jwtService.verifyAsync(
      customHeader.split(' ')[1],
      {
        secret: process.env.JWT_SECRET,
      },
    );
    const user = await this.userService.findOne(id);
    if (user.role === 'admin') {
      return true;
    } else {
      throw new ForbiddenException('You do not have permission');
    }
  }
}
