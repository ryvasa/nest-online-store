import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Product } from '../../products/interfaces/product.interface';
import { Stock } from '../../stocks/interfaces/stock.interface';
import { ShippingAddress } from 'src/payments/dto/create-payment.dto';
import { Type } from 'class-transformer';

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
        product: '66c9c2be3799102c7634872a',
        stock: '66c9c2e93799102c7634872c',
        quantity: 1,
      },
    ],
    description: 'items',
    type: [DataItem],
  })
  items: DataItem[];

  @ApiProperty({
    example: 'bank_transfer',
    description: 'Payment Methode',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  payment_methode: string;

  @ApiProperty({
    example: {
      first_name: 'Ryan',
      last_name: 'Oktavian Saputra',
      email: 'ryan@gmail.com',
      phone: '1234567890',
      address: 'Jl. Jareged RT 01 RW 01',
      city: 'Tasikmalaya',
      postal_code: '46465',
      country_code: 'IDN',
    },
    description: 'Shipping address details',
    type: ShippingAddress,
  })
  @ValidateNested()
  @Type(() => ShippingAddress)
  shipping_address: ShippingAddress;

  @ApiProperty({
    example: 'bca',
    description: 'Address of receiver',
    type: String,
  })
  @IsOptional()
  bank_transfer: string;
}
