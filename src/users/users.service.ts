import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.auth', 'auth')
      .getMany();
    return users;
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(
    auth: User,
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const validUser = await this.validUser(auth, id);
    if (!validUser) {
      throw new UnauthorizedException('You can not update this user!');
    }
    const user = await this.findOne(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(auth: User, id: string): Promise<object> {
    // const validUser = await this.validUser(auth, id);
    // if (!validUser) {
    //   throw new UnauthorizedException('You can not delete this user!');
    // }
    const user = await this.findOne(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    await this.userRepository.remove(user);
    return { message: 'User has been deleted' };
  }

  async validUser(auth: User, id: string): Promise<boolean> {
    const user = await this.findOne(id);
    if (auth.id === user.id) {
      return true;
    } else {
      return false;
    }
  }
}
