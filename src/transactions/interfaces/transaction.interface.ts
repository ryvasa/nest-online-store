import { Document } from 'mongoose';
import { Product } from '../../products/interfaces/product.interface';
import { Stock } from '../../stocks/interfaces/stock.interface';
import { Status } from '../schema/transaction.schema';
export interface Transaction extends Document {
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
  readonly address: number;
  readonly status: Status;
  readonly totalPrice: number;
  readonly createdDate: Date;
}
