import { Document } from 'mongoose';
export interface Product extends Document {
  readonly productName: string;
  readonly description: string;
  readonly category: Array<string>;
  readonly price: number;
  readonly images: Array<string>;
  readonly material?: string;
}
