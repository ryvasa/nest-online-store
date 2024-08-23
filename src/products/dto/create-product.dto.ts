import { ApiProperty } from '@nestjs/swagger';
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
    example: ['image1.png', 'image2.png'],
    description: 'product image',
    type: Array,
  })
  @IsString({ each: true })
  @IsNotEmpty()
  readonly images: Array<string>;
}
