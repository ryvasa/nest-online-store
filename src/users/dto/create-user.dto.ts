import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Jhon',
    description: 'The name of the user',
    type: String,
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'The name of the user',
    type: String,
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    example: 'johndoe',
    description: 'The username of the user',
    type: String,
  })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'The email of the user',
    type: String,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '1234567890',
    description: 'The phone number of the user',
    type: String,
  })
  @IsString()
  phone: string;

  @ApiProperty({
    example: 'password123',
    description: 'The password of the user',
    required: false,
    type: String,
  })
  @IsString()
  password: string;
}
