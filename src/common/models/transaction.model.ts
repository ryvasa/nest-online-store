import { ApiProperty } from '@nestjs/swagger';
import { ProductData } from './product.model';
import { StockData } from './stock.model';

export class DataItem {
  @ApiProperty({ type: String, example: '123-abc-456-def' })
  product: string;

  @ApiProperty({ type: String, example: '123-abc-456-def' })
  stock: string;

  @ApiProperty({ type: Number, example: 10 })
  quantity: number;

  @ApiProperty({ type: Number, example: 10 })
  price: number;

  @ApiProperty({ type: String, example: '123-abc-456-def' })
  _id: string;
}

export class TransactionData {
  @ApiProperty({ type: String, example: '123-abc-456-def' })
  _id: string;

  @ApiProperty({ type: String, example: '123-abc-456-def' })
  userId: string;

  @ApiProperty({ type: [DataItem] })
  items: DataItem[];

  @ApiProperty({ type: Number, example: 10 })
  totalPrice: number;

  @ApiProperty({ type: Date, example: '2022-01-01T00:00:00.000Z' })
  createdDate: Date;

  @ApiProperty({ type: Date, example: '2022-01-01T00:00:00.000Z' })
  updatedDate: Date;

  @ApiProperty({ type: String, example: 'New York, United States' })
  address: string;

  @ApiProperty({ type: String, example: 'process' })
  status: string;

  @ApiProperty({ type: Number, example: 0 })
  __v: number;
}

export class TransactionResponse {
  @ApiProperty({ type: TransactionData })
  data: TransactionData;
}
export class DataAggregateItem {
  @ApiProperty({ type: ProductData })
  product: ProductData;

  @ApiProperty({ type: StockData })
  stock: StockData;

  @ApiProperty({ type: Number, example: 10 })
  quantity: number;

  @ApiProperty({ type: Number, example: 10 })
  price: number;

  @ApiProperty({ type: String, example: '123-abc-456-def' })
  _id: string;
}

export class TransactionAggregateData {
  @ApiProperty({ type: String, example: '123-abc-456-def' })
  _id: string;

  @ApiProperty({ type: String, example: '123-abc-456-def' })
  userId: string;

  @ApiProperty({ type: [DataAggregateItem] })
  items: DataAggregateItem[];

  @ApiProperty({ type: Number, example: 10 })
  totalPrice: number;

  @ApiProperty({ type: Date, example: '2022-01-01T00:00:00.000Z' })
  createdDate: Date;

  @ApiProperty({ type: Date, example: '2022-01-01T00:00:00.000Z' })
  updatedDate: Date;

  @ApiProperty({ type: String, example: 'New York, United States' })
  address: string;

  @ApiProperty({ type: String, example: 'process' })
  status: string;

  @ApiProperty({ type: Number, example: 0 })
  __v: number;
}

export class TransactionAggregateResponse {
  @ApiProperty({ type: TransactionAggregateData })
  data: TransactionAggregateData;
}
