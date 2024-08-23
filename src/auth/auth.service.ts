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
import { DataSource, Repository } from 'typeorm';
import {
  GoogleAuthRequest,
  LoginData,
  MessageData,
  RefreshData,
} from 'src/common/models/auth.model';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Auth) private authRepository: Repository<Auth>,
    private dataSource: DataSource,
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

  async generateAccessToken(id: string, username: string): Promise<string> {
    const accessToken = await this.jwtService.signAsync(
      {
        id,
        username,
      },
      { secret: process.env.JWT_SECRET, expiresIn: '1d' },
    );
    return accessToken;
  }

  async login(auth: User): Promise<LoginData> {
    const accessToken = await this.generateAccessToken(auth.id, auth.username);
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

  async googleAuth(auth: GoogleAuthRequest): Promise<LoginData | object> {
    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const findUserByProviderId = await this.authRepository
        .createQueryBuilder('auth')
        .leftJoinAndSelect('auth.user', 'user')
        .where('auth.providerId = :providerId', { providerId: auth.providerId })
        .getOne();

      if (findUserByProviderId) {
        return this.login(findUserByProviderId.user);
      }
      const createUser = this.userRepository.create({
        username: auth.username,
        email: auth.email,
        name: auth.name,
      });
      await queryRunner.manager.save(createUser);

      const createAuth = this.authRepository.create({
        providerId: auth.providerId,
        provider: auth.provider,
        user: createUser,
      });
      await queryRunner.manager.save(createAuth);

      // Commit if all success
      await queryRunner.commitTransaction();

      return this.login(createUser);
    } catch (error) {
      // Rollback if error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release queryRunner
      await queryRunner.release();
    }
  }

  async refreshToken(auth: User): Promise<RefreshData> {
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
    const accessToken = await this.generateAccessToken(auth.id, auth.username);
    return { accessToken };
  }

  async me(id: string): Promise<User> {
    const auth = await this.userRepository.findOneBy({ id });
    if (!auth) {
      throw new NotFoundException('User not found');
    }
    if (!auth.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return auth;
  }

  async logout(id: string): Promise<MessageData> {
    const user = await this.me(id);
    await this.userRepository.save({
      ...user,
      refreshToken: null,
    });
    return { message: 'User has been logout' };
  }
}
