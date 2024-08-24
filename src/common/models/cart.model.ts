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
}
export class CartData {
  @ApiProperty({ type: String, example: '123-abc-456-def' })
  _id: string;

  @ApiProperty({ type: String, example: '123-abc-456-def' })
  userId: string;

  @ApiProperty({ type: [DataItem] })
  items: DataItem[];
}

export class CartResponse {
  @ApiProperty({ type: CartData })
  data: CartData;
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
}

export class CartAggregateData {
  @ApiProperty({ type: String, example: '123-abc-456-def' })
  _id: string;

  @ApiProperty({ type: String, example: '123-abc-456-def' })
  userId: string;

  @ApiProperty({ type: [DataAggregateItem] })
  items: DataAggregateItem[];
}

export class CartAggregateResponse {
  @ApiProperty({ type: CartAggregateData })
  data: CartAggregateData;
}

export class CountData {
  @ApiProperty({ type: Number })
  quantity: number;
}

export class CountResponse {
  @ApiProperty({ type: CountData })
  data: CountData;
}
