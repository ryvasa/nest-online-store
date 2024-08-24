import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Product } from '../../products/schema/product.schema';
import mongoose from 'mongoose';
import { Stock } from '../../stocks/schema/stock.schema';
export enum Status {
  SUCCESS = 'success',
  PROCESS = 'process',
  FAILED = 'failed',
}
@Schema({ timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } })
export class Transactions {
  @Prop({ required: true, unique: false })
  userId: string;

  @Prop({
    required: true,
    type: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        stock: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock' },
        quantity: { type: Number },
        price: { type: Number },
      },
    ],
  })
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId;
        ref: Product;
        required: true;
      };

      stock: {
        type: mongoose.Schema.Types.ObjectId;
        ref: Stock;
        required: true;
      };

      quantity: number;
      price: number;
    },
  ];

  @Prop({ required: true })
  address: string;

  @Prop({ required: true, default: Status.PROCESS, enum: Status })
  status: Status;

  @Prop({ required: true })
  totalPrice: number;
}
export const TransactionSchema = SchemaFactory.createForClass(Transactions);
