import { Document } from 'mongoose';
export interface Product extends Document {
  readonly productName: string;
  readonly description: string;
  readonly category: Array<string>;
}
