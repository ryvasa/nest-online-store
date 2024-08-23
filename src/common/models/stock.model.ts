import { ApiProperty } from '@nestjs/swagger';
import { ProductData } from './product.model';

export class StockData {
  @ApiProperty({ type: String, example: '123-abc-456-def' })
  _id: string;

  @ApiProperty({ type: ProductData })
  product: ProductData;

  @ApiProperty({ type: String, example: 'XL' })
  size: string;

  @ApiProperty({ type: String, example: 'Red' })
  color: string;

  @ApiProperty({ type: Date, example: '2024-08-22T06:58:54.173Z' })
  createdDate: Date;

  @ApiProperty({ type: Date, example: '2024-08-22T06:58:54.173Z' })
  updatedDate: Date;

  @ApiProperty({ type: Number, example: 100 })
  stock: number;

  @ApiProperty({ type: Number, example: 0 })
  __v: number;

  @ApiProperty({
    example: 'image1',
    type: String,
  })
  image?: string;

  @ApiProperty({ type: Number, example: 100 })
  weight?: number;

  @ApiProperty({ type: Number, example: 100 })
  length?: number;

  @ApiProperty({ type: Number, example: 100 })
  width?: number;

  @ApiProperty({ type: Number, example: 100 })
  height?: number;
}

export class StockResponse {
  @ApiProperty({ type: StockData })
  data: StockData;
}

export class ArrayStockResponse {
  @ApiProperty({ type: [StockData] })
  data: StockData[];
}

export class StockMessage {
  @ApiProperty({ type: String, example: 'Stock has been deleted' })
  message: string;
}

export class StockMessageResponse {
  @ApiProperty({ type: StockMessage })
  data: StockMessage;
}

export class StockQuery {
  productName: string;
  take: number;
  skip: number;
}
