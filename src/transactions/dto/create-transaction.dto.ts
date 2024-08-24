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
    example: [
      {
        product: '5f7b9f5a0a0a0a0a0a0a0a0a',
        stock: '5f7b9f5a0a0a0a0a0a0a0a0a',
        quantity: 1,
      },
    ],
    description: 'items',
    type: [DataItem],
  })
  items: DataItem[];

  @ApiProperty({
    example: 'Jl. Raya Ciledug',
    description: 'Address of receiver',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  address: string;
}
