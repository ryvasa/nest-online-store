import { Document } from 'mongoose';
import { Product } from '../../products/schema/product.schema';
import { Stock } from '../../stocks/schema/stock.schema';
export interface Cart extends Document {
  readonly _id: string;
  readonly userId: string;
  readonly items: [
    {
      readonly product: Product;
      readonly stock: Stock;
      readonly quantity: number;
      readonly price: number;
    },
  ];
}
