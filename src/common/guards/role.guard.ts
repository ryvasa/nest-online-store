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
    const customHeader = request.headers['authorization'].split(' ')[1]; // Ganti dengan header yang sesuai
    const { id } = await this.jwtService.verifyAsync(customHeader, {
      secret: process.env.JWT_SECRET,
    });
    const user = await this.userService.findOne(id);
    if (user.role === 'admin') {
      return true;
    } else {
      throw new ForbiddenException('You do not have permission');
    }
  }
}
