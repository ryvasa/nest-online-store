import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({ timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } })
export class Product {
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

  @Prop({ required: true })
  images: string[];
}
export const ProductSchema = SchemaFactory.createForClass(Product);
