import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductsService } from '../products/products.service';
import { Stock } from './interfaces/stock.interface';
import { StockMessage } from '../common/models/stock.model';

@Injectable()
export class StocksService {
  constructor(
    @InjectModel('Stocks') private stockModel: Model<Stock>,
    private productService: ProductsService,
  ) {}

  async create(createStockDto: CreateStockDto): Promise<Stock> {
    const stock = new this.stockModel(createStockDto);
    const res = await stock.save();
    return res;
  }

  async findAll(): Promise<Stock[]> {
    return this.stockModel.find().exec();
  }

  async findAllByProductId(id: string): Promise<Stock[]> {
    await this.productService.findOne(id);
    return this.stockModel.find({ product: id }).exec();
  }

  async findOne(productId: string, stockId: string): Promise<Stock> {
    await this.productService.findOne(productId);
    const stock = await this.stockModel.findById(stockId).exec();
    if (!stock) {
      throw new NotFoundException(`Stock with ID ${stockId} not found`);
    }
    return stock;
  }

  async update(
    productId: string,
    stockId: string,
    updateStockDto: UpdateStockDto,
  ): Promise<Stock> {
    await this.productService.findOne(productId);
    const stock = await this.findOne(productId, stockId);

    Object.assign(stock, updateStockDto);
    return stock.save();
  }

  async remove(productId: string, stockId: string): Promise<StockMessage> {
    await this.productService.findOne(productId);
    const stock = await this.findOne(productId, stockId);
    stock.deleteOne();
    return { message: 'Stock has been deleted' };
  }
}
