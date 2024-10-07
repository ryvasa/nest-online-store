import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;

  const USER_REPOSITORY_TOKEN = getRepositoryToken(User);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(USER_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('userRepository should be defined', () => {
    expect(userRepository).toBeDefined();
  });

  describe('create user', () => {
    jest.spyOn(bcrypt, 'hash').mockImplementation(() => 'hashed-password');
    it('should hashing password', async () => {
      await service.create({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: '3Tqg3@example.com',
        password: 'password',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
    });
    it('userRepository.create should be called with user value', async () => {
      await service.create({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: '3Tqg3@example.com',
        password: 'password',
      });

      expect(userRepository.create).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: '3Tqg3@example.com',
        password: 'hashed-password',
      });
    });
    it('should save user and return the saved user', async () => {
      const createdUser = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: '3Tqg3@example.com',
        password: 'hashed-password',
        phone: null,
        role: UserRole.USER,
        createdDate: new Date(),
        updatedDate: new Date(),
        refreshToken: null,
        auth: null,
      };

      userRepository.create = jest.fn().mockReturnValue(createdUser);
      userRepository.save = jest.fn().mockResolvedValue(createdUser);

      const user = await service.create({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: '3Tqg3@example.com',
        password: 'password',
      });

      expect(userRepository.save).toHaveBeenCalledWith(createdUser);
      expect(user).toEqual({
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: '3Tqg3@example.com',
        password: 'hashed-password',
        phone: null,
        role: UserRole.USER,
        createdDate: expect.any(Date),
        updatedDate: expect.any(Date),
        refreshToken: null,
        auth: null,
      });
    });

    it('should throw BadRequestException if user exist', async () => {
      const mockUser = {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: '3Tqg3@example.com',
        password: 'password',
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      userRepository.save = jest
        .fn()
        .mockRejectedValue(
          new BadRequestException(
            'User already exists with this email or username',
          ),
        );

      await expect(service.create(mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('find one user', () => {
    it('userRepository.findOne should be called with user value', async () => {
      const user = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: '3Tqg3@example.com',
        password: 'hashed-password',
        phone: null,
        role: UserRole.USER,
        createdDate: new Date(),
        updatedDate: new Date(),
        refreshToken: null,
        auth: null,
      };
      userRepository.findOne = jest.fn().mockResolvedValue(user);
      const result = await service.findOne('1');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual({
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: '3Tqg3@example.com',
        password: 'hashed-password',
        phone: null,
        role: UserRole.USER,
        createdDate: expect.any(Date),
        updatedDate: expect.any(Date),
        refreshToken: null,
        auth: null,
      });
    });

    it('should throw error if user not found', async () => {
      userRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow('User not found');
    });
  });

  describe('find all Users', () => {
    it('should filter users by name and apply pagination', async () => {
      const user = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: '3Tqg3@example.com',
        password: 'hashed-password',
        phone: null,
        role: UserRole.USER,
        createdDate: new Date(),
        updatedDate: new Date(),
        refreshToken: null,
        auth: null,
      };

      userRepository.createQueryBuilder = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([user]),
      });

      const result = await service.findAll({ name: 'John', take: 10, skip: 0 });

      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(userRepository.createQueryBuilder().where).toHaveBeenCalledWith(
        'user.name LIKE :name OR user.username LIKE :name',
        { name: '%John%' },
      );
      expect(userRepository.createQueryBuilder().skip).toHaveBeenCalledWith(0);
      expect(userRepository.createQueryBuilder().take).toHaveBeenCalledWith(10);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            username: 'johndoe',
          }),
        ]),
      );
    });
  });

  describe('update user', () => {
    const auth = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: '3Tqg3@example.com',
      password: 'hashed-password',
      phone: null,
      role: UserRole.USER,
      createdDate: new Date(),
      updatedDate: new Date(),
      refreshToken: null,
      auth: null,
    };
    it('userRepository.update should be called with user value', async () => {
      const updatedUser = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe Updated',
        username: 'johndoe',
        email: '3Tqg3@example.com',
        phone: null,
        role: UserRole.USER,
        createdDate: new Date(),
        updatedDate: new Date(),
        refreshToken: null,
        auth: null,
      };
      userRepository.findOne = jest.fn().mockResolvedValue(updatedUser);
      userRepository.save = jest.fn().mockResolvedValue(updatedUser);
      const result = await service.update(auth, '1', {
        lastName: 'Doe Updated',
      });

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual({
        id: '1',
        firstName: 'John',
        lastName: 'Doe Updated',
        username: 'johndoe',
        email: '3Tqg3@example.com',
        phone: null,
        role: UserRole.USER,
        createdDate: expect.any(Date),
        updatedDate: expect.any(Date),
        refreshToken: null,
        auth: null,
      });
    });

    it('userRepository.update should be called with new password', async () => {
      const auth = {
        id: '1',
        username: 'johndoe',
      } as User;

      const existingUser = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'johndoe@example.com',
        password: 'old-hashed-password',
      } as User;

      const updateUserDto = {
        password: 'new-password',
      };

      const updatedUser = {
        ...existingUser,
        password: 'new-hashed-password',
      };

      jest.spyOn(service, 'validUser').mockResolvedValue(true);
      jest.spyOn(service, 'findOne').mockResolvedValue(existingUser);
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve('new-hashed-password'));
      userRepository.save = jest.fn().mockResolvedValue(updatedUser);

      const result = await service.update(auth, '1', updateUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('new-password', 10);
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...existingUser,
          password: 'new-hashed-password',
        }),
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw UnauthorizedException if user not valid', async () => {
      userRepository.findOne = jest.fn().mockResolvedValue({
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: '3Tqg3@example.com',
        password: 'hashed-password',
        phone: null,
        role: UserRole.USER,
        createdDate: new Date(),
        updatedDate: new Date(),
        refreshToken: null,
        auth: null,
      });

      jest.spyOn(service, 'validUser').mockResolvedValue(false);

      await expect(
        service.update(
          { id: '2', username: 'janedoe' } as User, // auth user
          '1', // id to update
          { lastName: 'Doe Updated' }, // update data
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw error if user not found', async () => {
      userRepository.findOne = jest.fn().mockResolvedValue(null);
      jest.spyOn(service, 'validUser').mockResolvedValue(true);
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(
        service.update(auth, '2', { lastName: 'Doe Updated' }),
      ).rejects.toThrow(NotFoundException);

      expect(service.validUser).toHaveBeenCalled();
      expect(service.findOne).toHaveBeenCalled();
    });
  });

  describe('remove user', () => {
    const auth = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: '3Tqg3@example.com',
      password: 'hashed-password',
      phone: null,
      role: UserRole.USER,
      createdDate: new Date(),
      updatedDate: new Date(),
      refreshToken: null,
      auth: null,
    };
    it('userRepository.remove should be called with user value', async () => {
      userRepository.findOne = jest.fn().mockResolvedValue({ id: '1' });
      userRepository.remove = jest.fn().mockResolvedValue({ id: '1' });
      const result = await service.remove(auth, '1');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual({ message: 'User has been deleted' });
    });
    it('should throw error if user not found', async () => {
      const auth = { id: '1', username: 'testuser' } as User;

      jest.spyOn(service, 'validUser').mockResolvedValue(true);

      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(service.remove(auth, '2')).rejects.toThrow(
        new NotFoundException('User with ID 2 not found'),
      );

      expect(service.findOne).toHaveBeenCalledWith('2');
    });

    it('should throw error if user not valid', async () => {
      const auth = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: '3Tqg3@example.com',
        password: 'hashed-password',
        phone: null,
        role: UserRole.USER,
        createdDate: new Date(),
        updatedDate: new Date(),
        refreshToken: null,
        auth: null,
      };
      userRepository.findOne = jest.fn().mockResolvedValue(auth);
      jest.spyOn(service, 'validUser').mockResolvedValue(false);

      await expect(service.remove(auth, '1')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validate user', () => {
    const user = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: '3Tqg3@example.com',
      password: 'hashed-password',
      phone: null,
      role: UserRole.USER,
      createdDate: new Date(),
      updatedDate: new Date(),
      refreshToken: null,
      auth: null,
    };
    it('userRepository.findOne should be called with user value', async () => {
      userRepository.findOne = jest.fn().mockResolvedValue(user);
      const result = await service.validUser(
        {
          id: '1',
          username: 'johndoe',
        } as User,
        '1',
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(true);
    });

    it('should throw error if user not found', async () => {
      userRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow('User not found');
    });

    it('should throw error if user not valid', async () => {
      userRepository.findOne = jest.fn().mockResolvedValue({
        NotFoundException: 'User not found',
      });
      userRepository.findOne = jest.fn().mockResolvedValue(user);

      const result = await service.validUser(
        {
          id: '2',
          username: 'johndoe',
        } as User,
        '1',
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(false);
    });
  });
});
