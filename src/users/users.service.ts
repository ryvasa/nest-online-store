import {
  BadRequestException,
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
import { UserMessage, UserQuery } from '../common/models/user.model';
// import * as otpGenerator from 'otp-generator';
// import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    // private readonly mailService: MailerService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: [
        { email: createUserDto.email },
        { username: createUserDto.username },
      ],
    });
    if (existingUser) {
      throw new BadRequestException(
        'User already exists with this email or username',
      );
    }

    // TODO: Send OTP
    // const otp = otpGenerator.generate(6, {
    //   upperCaseAlphabets: true,
    //   specialChars: false,
    // });
    // this.mailService.sendMail({
    //   from: 'oktaviandua4.gmail.com',
    //   to: createUserDto.email,
    //   subject: `OTP for registration`,
    //   text: otp,
    // });

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.userRepository.save(user);
  }

  async findAll({ name, take, skip }: UserQuery): Promise<User[]> {
    const query = this.userRepository.createQueryBuilder('user');

    if (name) {
      query.where('user.name LIKE :name OR user.username LIKE :name', {
        name: `%${name}%`,
      });
    }

    query.skip(skip).take(take);

    const users = await query.getMany();
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
      throw new NotFoundException(`User not found`);
    }
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(auth: User, id: string): Promise<UserMessage> {
    const validUser = await this.validUser(auth, id);
    if (!validUser) {
      throw new UnauthorizedException('You can not delete this user!');
    }
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
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
