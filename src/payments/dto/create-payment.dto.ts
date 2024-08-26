import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ShippingAddress {
  @ApiProperty({
    example: 'Ryan',
    description: 'Name of receiver',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({
    example: 'Oktavian Saputra',
    description: 'Name of receiver',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({
    example: '123',
    description: 'Phone of receiver',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: 'jareged rt 01 rw 01',
    description: 'Address of receiver',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    example: 'Tasikmalaya',
    description: 'Name of city receiver',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    example: '46465',
    description: 'Postal code of receiver',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  postal_code: string;

  @ApiProperty({
    example: 'IDN',
    description: 'Coun of receiver',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  country_code: string;
}

class CustomerDetailsDto {
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @ValidateNested()
  shipping_address: ShippingAddress;
}

export class TransactionDetails {
  @IsString()
  @IsNotEmpty()
  order_id: string;

  @IsNumber()
  @IsNotEmpty()
  gross_amount: number;
}

export class Bank {
  @IsString()
  bank: string;
}
export class Item {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;
  @IsInt()
  @IsNotEmpty()
  quantity: number;
  @IsInt()
  @IsNotEmpty()
  price: number;
}
export class ChargePaymentDto {
  @IsString()
  @IsNotEmpty()
  payment_type: string;

  @ValidateNested()
  @IsOptional()
  bank_transfer?: Bank;

  @ValidateNested()
  customer_details: CustomerDetailsDto;

  @ValidateNested()
  transaction_details: TransactionDetails;

  @ValidateNested()
  item_details: Item[];
}
