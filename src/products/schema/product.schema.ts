import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({ timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } })
export class Products {
  @Prop()
  productName: string;

  @Prop()
  description: string;

  @Prop()
  category: Array<string>;
}
export const ProductSchema = SchemaFactory.createForClass(Products);
