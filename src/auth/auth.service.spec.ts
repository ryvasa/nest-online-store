import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Auth } from './entities/auth.entity';
import { DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GoogleAuthRequest, LoginData } from '../common/models/auth.model';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginAuthDto } from './dto/login-auth.dto';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let userRepository: Repository<User>;
  let authRepository: Repository<Auth>;
  let dataSource: DataSource;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Auth),
          useValue: {
            create: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn(),
              getOne: jest.fn(),
            }),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue({
              connect: jest.fn(),
              startTransaction: jest.fn(),
              commitTransaction: jest.fn(),
              rollbackTransaction: jest.fn(),
              release: jest.fn(),
              manager: {
                create: jest.fn(),
                save: jest.fn(),
                count: jest.fn(),
                createQueryBuilder: jest.fn().mockReturnValue({
                  leftJoinAndSelect: jest.fn().mockReturnThis(),
                  where: jest.fn().mockReturnThis(),
                  getOne: jest.fn(),
                }),
              },
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    authRepository = module.get<Repository<Auth>>(getRepositoryToken(Auth));
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(authRepository).toBeDefined();
    expect(dataSource).toBeDefined();
  });

  describe('login', () => {
    it('should login', async () => {
      const auth = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'johndoe@example.com',
        password: 'hashed-password',
        phone: null,
        role: UserRole.USER,
        createdDate: new Date(),
        updatedDate: new Date(),
        refreshToken: null,
      } as User;

      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';
      const updatedUser = {
        ...auth,
        refreshToken,
      };

      // Mock implementations
      jwtService.signAsync = jest
        .fn()
        .mockResolvedValueOnce(accessToken)
        .mockResolvedValueOnce(refreshToken);
      userRepository.save = jest.fn().mockResolvedValue(updatedUser);

      // Call the method
      const result = await service.login(auth);

      // Assertions
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { id: auth.id, username: auth.username },
        { secret: process.env.JWT_REFRESH, expiresIn: '7d' },
      );
      expect(userRepository.save).toHaveBeenCalledWith({
        ...auth,
        refreshToken,
      });
      expect(result).toEqual({
        ...updatedUser,
        accessToken,
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh token', async () => {
      const auth = {
        id: '1',
        username: 'johndoe',
        refreshToken: 'valid-refresh-token',
      } as User;

      const accessToken = 'new-access-token';

      jest.spyOn(service, 'me').mockResolvedValue(auth);
      jwtService.verifyAsync = jest.fn().mockResolvedValue({ id: auth.id });
      jest.spyOn(service, 'generateAccessToken').mockResolvedValue(accessToken);

      const result = await service.refreshToken(auth);

      expect(service.me).toHaveBeenCalledWith(auth.id);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(auth.refreshToken, {
        secret: process.env.JWT_REFRESH,
      });
      expect(service.generateAccessToken).toHaveBeenCalledWith(
        auth.id,
        auth.username,
      );
      expect(result).toEqual({ accessToken });
    });

    it('should throw UnauthorizedException if refresh token is invalid in refreshToken', async () => {
      const auth = {
        id: '1',
        username: 'johndoe',
        refreshToken: 'invalid-refresh-token',
      } as User;

      jest.spyOn(service, 'me').mockResolvedValue(auth);
      jwtService.verifyAsync = jest
        .fn()
        .mockRejectedValue(new UnauthorizedException());

      await expect(service.refreshToken(auth)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(service.me).toHaveBeenCalledWith(auth.id);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(auth.refreshToken, {
        secret: process.env.JWT_REFRESH,
      });
    });

    it('should throw UnauthorizedException if current user do not have refreshToken', async () => {
      const auth = {
        id: '1',
        username: 'johndoe',
        refreshToken: null,
      } as User;

      jest.spyOn(service, 'me').mockResolvedValue(auth);

      await expect(service.refreshToken(auth)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(service.me).toHaveBeenCalledWith(auth.id);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(auth.refreshToken, {
        secret: process.env.JWT_REFRESH,
      });
    });

    it('should throw UnauthorizedException if auth id not match with payload from jwt', async () => {
      const auth = {
        id: '1',
        username: 'johndoe',
        refreshToken: null,
      } as User;

      jest.spyOn(service, 'me').mockResolvedValue(auth);
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValue({ payload: { id: '2' } });

      await expect(service.refreshToken(auth)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(service.me).toHaveBeenCalledWith(auth.id);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(auth.refreshToken, {
        secret: process.env.JWT_REFRESH,
      });
    });
  });

  describe('me', () => {
    it('should return user in me function', async () => {
      const auth = {
        id: '1',
        username: 'johndoe',
        refreshToken: 'valid-refresh-token',
      } as User;

      userRepository.findOneBy = jest.fn().mockResolvedValue(auth);

      const result = await service.me(auth.id);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: auth.id });
      expect(result).toEqual(auth);
    });
    it('should throw UnauthorizedException if user is dont have refreshToken', async () => {
      const auth = {
        id: '1',
        username: 'johndoe',
      } as User;

      userRepository.findOneBy = jest.fn().mockResolvedValue(auth);

      await expect(service.me('1')).rejects.toThrow(UnauthorizedException);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    });
    it('should throw NotFoundException if user is not found in me function', async () => {
      userRepository.findOneBy = jest.fn().mockResolvedValue(null);

      await expect(service.me('1')).rejects.toThrow(NotFoundException);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      const auth = {
        id: '1',
        username: 'johndoe',
        refreshToken: 'valid-refresh-token',
      } as User;

      jest.spyOn(service, 'me').mockResolvedValue(auth);
      userRepository.save = jest
        .fn()
        .mockResolvedValue({ ...auth, refreshToken: null });

      const result = await service.logout(auth.id);

      expect(service.me).toHaveBeenCalledWith(auth.id);
      expect(userRepository.save).toHaveBeenCalledWith({
        ...auth,
        refreshToken: null,
      });
      expect(result).toEqual({ message: 'User has been logout' });
    });

    it('should throw NotFoundException if user is not found in logout function', async () => {
      userRepository.findOneBy = jest.fn().mockResolvedValue(null);

      await expect(service.me('1')).rejects.toThrow(NotFoundException);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    });
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      const loginDto = {
        email: 'johndoe@example.com',
        password: 'password123',
      } as LoginAuthDto;

      const user = {
        id: '1',
        email: loginDto.email,
        password: await bcrypt.hash(loginDto.password, 10), // hashed password
        username: 'johndoe',
        firstName: 'John',
      } as User;

      userRepository.findOneBy = jest.fn().mockResolvedValue(user);

      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      const result = await service.validateUser(loginDto);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        email: loginDto.email,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        user.password,
      );
      expect(result).toEqual({
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
      });
    });

    it('should throw NotFoundException if email not found in validateUser', async () => {
      const loginDto = {
        email: 'notfound@example.com',
        password: 'password123',
      } as LoginAuthDto;

      userRepository.findOneBy = jest.fn().mockResolvedValue(null);

      await expect(service.validateUser(loginDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        email: loginDto.email,
      });
    });

    it('should throw BadRequestException if password is missing in validateUser', async () => {
      const loginDto = {
        email: 'johndoe@example.com',
        password: 'password123',
      } as LoginAuthDto;

      const user = {
        id: '1',
        email: loginDto.email,
        password: null, // missing password
      } as User;

      userRepository.findOneBy = jest.fn().mockResolvedValue(user);

      await expect(service.validateUser(loginDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        email: loginDto.email,
      });
    });

    it('should return null if password does not match in validateUser', async () => {
      const loginDto = {
        email: 'johndoe@example.com',
        password: 'wrongpassword',
      } as LoginAuthDto;

      const user = {
        id: '1',
        email: loginDto.email,
        password: await bcrypt.hash('correctpassword', 10), // correct password
      } as User;

      userRepository.findOneBy = jest.fn().mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      const result = await service.validateUser(loginDto);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        email: loginDto.email,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        user.password,
      );
      expect(result).toBeNull();
    });
  });

  describe('generateAccessToken', () => {
    it('should generate access token', async () => {
      const id = '1';
      const username = 'johndoe';
      const accessToken = 'access-token';

      jwtService.signAsync = jest.fn().mockResolvedValue(accessToken);

      const result = await service.generateAccessToken(id, username);

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { id, username },
        { secret: process.env.JWT_SECRET, expiresIn: '1d' },
      );
      expect(result).toEqual(accessToken);
    });
  });

  describe('googleAuth', () => {
    it('should find user by providerId and return login data', async () => {
      const auth: GoogleAuthRequest = {
        providerId: 'google-123',
        provider: 'google',
        username: 'johndoe',
        email: 'johndoe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        picture: 'picture',
      };

      const foundAuth = {
        providerId: auth.providerId,
        user: { id: '1', username: auth.username },
      } as Auth;

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(foundAuth),
      };

      const queryRunner = dataSource.createQueryRunner();
      queryRunner.manager.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockQueryBuilder);

      jest
        .spyOn(service, 'login')
        .mockResolvedValue({ accessToken: 'token' } as LoginData);

      const result = await service.googleAuth(auth);

      expect(
        queryRunner.manager.createQueryBuilder().getOne,
      ).toHaveBeenCalled();
      expect(service.login).toHaveBeenCalledWith(foundAuth.user);
      expect(result).toEqual({ accessToken: 'token' });
    });

    it('should create a new user and auth record if not found', async () => {
      const auth: GoogleAuthRequest = {
        providerId: 'google-123',
        provider: 'google',
        username: 'johndoe',
        email: 'johndoe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        picture: 'picture',
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      const queryRunner = dataSource.createQueryRunner();
      queryRunner.manager.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockQueryBuilder);

      queryRunner.manager.create = jest
        .fn()
        .mockReturnValueOnce({ id: '1', ...auth }) // First call for User
        .mockReturnValueOnce({
          // Second call for Auth
          providerId: auth.providerId,
          provider: auth.provider,
          user: { id: '1', username: auth.username },
        });

      queryRunner.manager.save = jest
        .fn()
        .mockResolvedValueOnce({ id: '1', ...auth }) // First call for User
        .mockResolvedValueOnce({
          // Second call for Auth
          providerId: auth.providerId,
          provider: auth.provider,
          user: { id: '1', username: auth.username },
        });

      jest
        .spyOn(service, 'login')
        .mockResolvedValue({ accessToken: 'token' } as LoginData);

      const result = await service.googleAuth(auth);

      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.manager.create).toHaveBeenCalledWith(User, {
        username: auth.username,
        email: auth.email,
        firstName: auth.firstName,
      });
      expect(queryRunner.manager.save).toHaveBeenCalledWith(
        expect.objectContaining({
          username: auth.username,
          email: auth.email,
          firstName: auth.firstName,
        }),
      );
      expect(queryRunner.manager.create).toHaveBeenCalledWith(Auth, {
        providerId: auth.providerId,
        provider: auth.provider,
        user: expect.any(Object),
      });
      expect(queryRunner.manager.save).toHaveBeenCalledWith(
        expect.objectContaining({
          providerId: auth.providerId,
          provider: auth.provider,
        }),
      );
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(service.login).toHaveBeenCalledWith(
        expect.objectContaining({
          username: auth.username,
        }),
      );
      expect(result).toEqual({ accessToken: 'token' });
    });

    it('should rollback transaction if an error occurs', async () => {
      const auth: GoogleAuthRequest = {
        providerId: 'google-123',
        provider: 'google',
        username: 'johndoe',
        email: 'johndoe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        picture: 'picture',
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      const queryRunner = dataSource.createQueryRunner();
      queryRunner.manager.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockQueryBuilder);

      queryRunner.manager.createQueryBuilder().getOne = jest
        .fn()
        .mockRejectedValue(new Error('DB Error'));

      await expect(service.googleAuth(auth)).rejects.toThrow('DB Error');

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });
});
