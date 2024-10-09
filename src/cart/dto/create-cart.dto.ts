import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { Product } from '../../products/interfaces/product.interface';
import { Stock } from '../../stocks/interfaces/stock.interface';

export class CreateCartDto {
  @ApiProperty({
    example: '100sklal1234',
    description: 'product',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  readonly product: string;

  @ApiProperty({
    example: '100sklal1234',
    description: 'stock',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  readonly stock: string;

  @ApiProperty({
    example: '100sklal1234',
    description: 'product',
    type: String,
  })
  @IsInt()
  @IsNotEmpty()
  readonly quantity: number;
}
