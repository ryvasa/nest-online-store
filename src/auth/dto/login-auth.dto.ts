import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginAuthDto {
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
