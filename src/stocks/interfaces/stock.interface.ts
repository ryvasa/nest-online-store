import { Document } from 'mongoose';
import { Product } from '../../products/schema/product.schema';
export interface Stock extends Document {
  readonly product: Product;
  stock: number;
  readonly color: string;
  readonly size: string;
  readonly image: string;
  readonly weight?: number;
  readonly length?: number;
  readonly width?: number;
  readonly height?: number;
}
