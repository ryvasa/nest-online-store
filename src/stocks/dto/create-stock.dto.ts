import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStockDto {
  @ApiProperty({
    example: '100sklal1234',
    description: 'product',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  readonly product: string;

  @ApiProperty({
    example: 100,
    description: 'product stock',
    type: String,
  })
  @IsInt()
  @IsNotEmpty()
  readonly stock: string;

  @ApiProperty({
    example: 'Product size',
    description: 'product size',
    type: String,
  })
  @IsString()
  @IsOptional()
  readonly size: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Stock image',
  })
  @Type(() => Object)
  image: string;

  @ApiProperty({
    example: 'Product color',
    description: 'product color',
    type: String,
  })
  @IsString()
  @IsOptional()
  readonly color: string;

  @ApiProperty({
    example: 100,
    description: 'product length in cm',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  readonly length: number;

  @ApiProperty({
    example: 100,
    description: 'product width in cm',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  readonly width: number;

  @ApiProperty({
    example: 100,
    description: 'product height in cm',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  readonly height: number;

  @ApiProperty({
    example: 100,
    description: 'product weight in gram',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  readonly weight: number;
}
