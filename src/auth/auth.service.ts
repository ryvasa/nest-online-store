import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginAuthDto } from './dto/login-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Auth } from './entities/auth.entity';
import { Repository } from 'typeorm';
import {
  CurrentUser,
  LoginResponse,
} from 'src/common/interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Auth) private authRepository: Repository<Auth>,
    private jwtService: JwtService,
  ) {}

  async validateUser(data: LoginAuthDto): Promise<any> {
    const user = await this.userRepository.findOneBy({
      email: data.email,
    });

    if (!user) {
      throw new NotFoundException('Email not found');
    }
    if (!user.password) {
      throw new BadRequestException('Wrong password');
    }
    const isMatch = await bcrypt.compare(data.password, user.password);

    if (user && isMatch) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async generateAccessToken(auth: CurrentUser): Promise<string> {
    const accessToken = await this.jwtService.signAsync(
      {
        id: auth.id,
        username: auth.username,
      },
      { secret: process.env.JWT_SECRET, expiresIn: '1d' },
    );
    return accessToken;
  }

  async login(auth: CurrentUser): Promise<LoginResponse> {
    const accessToken = await this.generateAccessToken(auth);
    const refreshToken = await this.jwtService.signAsync(
      {
        id: auth.id,
        username: auth.username,
      },
      { secret: process.env.JWT_REFRESH, expiresIn: '7d' },
    );
    const updatedUser = await this.userRepository.save({
      ...auth,
      refreshToken,
    });
    return { ...updatedUser, accessToken };
  }

  async refreshToken(auth: CurrentUser): Promise<object> {
    const currentUser = await this.me(auth.id);
    const payload = await this.jwtService.verifyAsync(
      currentUser.refreshToken,
      {
        secret: process.env.JWT_REFRESH,
      },
    );
    if (!currentUser.refreshToken || payload.id !== auth.id) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const accessToken = await this.generateAccessToken(auth);
    return { accessToken };
  }

  async me(id: string): Promise<User> {
    const auth = await this.userRepository.findOneBy({ id });
    if (!auth) {
      throw new NotFoundException('User not found');
    }
    return auth;
  }

  async logout(id: string): Promise<string> {
    const user = await this.me(id);
    await this.userRepository.save({
      ...user,
      refreshToken: null,
    });
    return 'User has been logout';
  }
}
