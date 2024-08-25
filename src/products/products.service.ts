import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductMessage, ProductQuery } from '../common/models/product.model';
import { Product } from './interfaces/product.interface';

@Injectable()
export class ProductsService {
  constructor(@InjectModel('Products') private productModel: Model<Product>) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    if (!createProductDto.images || createProductDto.images.length === 0) {
      throw new BadRequestException('At least one image must be uploaded');
    }
    const product = new this.productModel(createProductDto);
    return product.save();
  }

  async findAll({ productName, take, skip }: ProductQuery): Promise<Product[]> {
    const query = productName
      ? { productName: new RegExp(productName, 'i') }
      : {};

    return this.productModel.find(query).skip(skip).limit(take).exec();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return product.save();
  }

  async remove(id: string): Promise<ProductMessage> {
    const product = await this.findOne(id);
    product.deleteOne();
    return { message: 'Product has been deleted' };
  }
}
