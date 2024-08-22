import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({ type: String })
  @IsString()
  googleId: string;
}
