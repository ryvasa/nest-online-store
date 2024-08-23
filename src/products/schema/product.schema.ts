import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({ timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } })
export class Products {
  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  category: Array<string>;

  @Prop({ required: true })
  price: number;

  @Prop()
  material: string;

  @Prop()
  weight: number;

  @Prop({ required: true })
  images: Array<string>;

  @Prop()
  length: number;

  @Prop()
  width: number;

  @Prop()
  height: number;
}
export const ProductSchema = SchemaFactory.createForClass(Products);
