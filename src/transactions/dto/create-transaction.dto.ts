import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Product } from '../../products/interfaces/product.interface';
import { Stock } from '../../stocks/interfaces/stock.interface';

class DataItem {
  product: Product;
  stock: Stock;
  quantity: number;
  price: number;
}

export class CreateTransactionDto {
  @ApiProperty({
    example: '100sklal1234',
    description: 'product',
    type: [DataItem],
  })
  items: DataItem[];

  @ApiProperty({
    example: '100sklal1234',
    description: 'product',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  address: string;
}
