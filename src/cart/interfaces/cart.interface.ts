import { Document } from 'mongoose';
import { Product } from '../../products/interfaces/product.interface';
import { Stock } from '../../stocks/interfaces/stock.interface';
export interface Cart extends Document {
  readonly _id: string;
  readonly userId: string;
  readonly items: [
    {
      product: Product;
      stock: Stock;
      quantity: number;
      readonly price: number;
    },
  ];
}
