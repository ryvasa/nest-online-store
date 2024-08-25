import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
export class CreateProductDto {
  @ApiProperty({
    example: 'Product 1',
    description: 'product name',
    type: String,
  })
  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  readonly productName: string;

  @ApiProperty({
    example: 'Product description',
    description: 'product description',
    type: String,
  })
  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  readonly description: string;

  @ApiProperty({
    example: ['category1', 'category2'],
    description: 'product category',
    type: Array,
  })
  @IsString({ each: true })
  @IsNotEmpty()
  readonly category: Array<string>;

  @ApiProperty({
    example: 100,
    description: 'product price',
    type: Number,
  })
  @IsNotEmpty()
  readonly price: number;

  @ApiProperty({
    example: 'Material',
    description: 'product material',
    type: String,
  })
  @IsString()
  @MaxLength(30)
  @IsOptional()
  readonly material: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Product images',
  })
  @Type(() => Object)
  images: string[];
}
