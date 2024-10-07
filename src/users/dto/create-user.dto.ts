import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'John',
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
  @IsOptional()
  lastName?: string;

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
    example: 'password123',
    description: 'The password of the user',
    required: false,
    type: String,
  })
  @IsString()
  password: string;
}
