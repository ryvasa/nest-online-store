import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Product } from '../../products/schema/product.schema';
import mongoose from 'mongoose';
import { Stock } from '../../stocks/schema/stock.schema';
@Schema({ timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } })
export class Cart {
  // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
  // product: Product;

  // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Stock' })
  // stock: Stock;

  // @Prop({ required: true })
  // quantity: number;

  @Prop({ required: true, unique: true })
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
}
export const CartSchema = SchemaFactory.createForClass(Cart);
