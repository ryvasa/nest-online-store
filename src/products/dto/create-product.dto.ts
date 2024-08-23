import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
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
    example: '[category1, category2]',
    description: 'product category',
    type: Array,
  })
  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  readonly category: Array<string>;
}
