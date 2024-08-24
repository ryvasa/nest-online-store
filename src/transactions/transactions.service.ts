import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from './interfaces/transaction.interface';
import { Stock } from '../stocks/interfaces/stock.interface';
import { Cart } from '../cart/interfaces/cart.interface';
import * as mongoose from 'mongoose';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    @InjectModel('Transaction')
    private readonly transactionModel: Model<Transaction>,
    @InjectModel('Cart') private readonly cartModel: Model<Cart>,
    @InjectModel('Stock') private readonly stockModel: Model<Stock>,
    @InjectModel('Product') private readonly productModel: Model<Stock>,
  ) {}

  async create(
    userId: string,
    createTransactionDto: CreateTransactionDto,
  ): Promise<any> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const transaction = await this.transactionModel.create({
        userId,
        ...createTransactionDto,
      });
      await transaction.save({ session });
      session.commitTransaction();
      return transaction;
    } catch (error) {
      console.log('first');
      session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  findAll() {
    return this.transactionModel.aggregate([
      {
        $unwind: '$items',
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'items.product',
        },
      },
      {
        $unwind: '$items.product',
      },
      {
        $lookup: {
          from: 'stocks',
          localField: 'items.stock',
          foreignField: '_id',
          as: 'items.stock',
        },
      },
      {
        $unwind: '$items.stock',
      },
      {
        $group: {
          _id: '$_id',
          userId: { $first: '$userId' },
          address: { $first: '$address' },
          status: { $first: '$status' },
          items: {
            $push: {
              product: '$items.product',
              stock: '$items.stock',
              quantity: '$items.quantity',
              price: { $multiply: ['$items.product.price', '$items.quantity'] },
            },
          },
        },
      },
    ]);
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
