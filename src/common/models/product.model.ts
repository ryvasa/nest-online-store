import { ApiProperty } from '@nestjs/swagger';

export class ProductData {
  @ApiProperty({ type: String, example: '123-abc-456-def' })
  _id: string;

  @ApiProperty({ type: String, example: 'Product 1' })
  productName: string;

  @ApiProperty({ type: String, example: 'Product Description' })
  description: string;

  @ApiProperty({
    example: ['category1', 'category2'],
    type: Array,
  })
  category: Array<string>;

  @ApiProperty({ type: Date, example: '2024-08-22T06:58:54.173Z' })
  createdDate: Date;

  @ApiProperty({ type: Date, example: '2024-08-22T06:58:54.173Z' })
  updatedDate: Date;

  @ApiProperty({ type: Number, example: 100 })
  price: number;

  @ApiProperty({ type: Number, example: 0 })
  __v: number;

  @ApiProperty({
    example: ['image1', 'image2'],
    type: Array<string>,
  })
  images: Array<string>;

  @ApiProperty({ type: String, example: 'material' })
  material?: string;
}

export class ProductResponse {
  @ApiProperty({ type: ProductData })
  data: ProductData;
}

export class ArrayProductResponse {
  @ApiProperty({ type: [ProductData] })
  data: ProductData[];
}

export class ProductMessage {
  @ApiProperty({ type: String, example: 'Product has been deleted' })
  message: string;
}

export class ProductMessageResponse {
  @ApiProperty({ type: ProductMessage })
  data: ProductMessage;
}

export class ProductQuery {
  productName: string;
  take: number;
  skip: number;
}
