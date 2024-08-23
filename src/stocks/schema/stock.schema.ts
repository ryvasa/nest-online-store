import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Product } from '../../products/schema/product.schema';
import mongoose from 'mongoose';
@Schema({ timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } })
export class Stock {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
  product: Product;

  @Prop({ required: true })
  stock: number;

  @Prop()
  color: string;

  @Prop()
  size: string;

  @Prop()
  image: string;

  @Prop()
  weight: number;

  @Prop()
  length: number;

  @Prop()
  width: number;

  @Prop()
  height: number;
}
export const StockSchema = SchemaFactory.createForClass(Stock);
