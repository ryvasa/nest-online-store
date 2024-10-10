import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import {
  UpdateStatusTransactionDto,
  UpdateTransactionDto,
} from './dto/update-transaction.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from './interfaces/transaction.interface';
import { Stock } from '../stocks/interfaces/stock.interface';
import { Cart } from '../cart/interfaces/cart.interface';
import * as mongoose from 'mongoose';
import { Product } from '../products/interfaces/product.interface';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    @InjectModel('Transaction')
    private readonly transactionModel: Model<Transaction>,
    @InjectModel('Cart') private readonly cartModel: Model<Cart>,
    @InjectModel('Product') private readonly productModel: Model<Product>,
    @InjectModel('Stock') private readonly stockModel: Model<Stock>,
  ) {}

  async create(
    userId: string,
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      let totalPrice = 0;
      const updatedItems = [];

      // Loop melalui setiap item dalam DTO untuk menghitung total harga dan menambahkan harga per item

      for (const item of createTransactionDto.items) {
        const product = await this.productModel
          .findById(item.product)
          .session(session)
          .exec();
        if (!product) {
          throw new NotFoundException('Product not found');
        }

        // Hitung harga untuk item tersebut
        const itemPrice = product.price * item.quantity;

        // Tambahkan harga item ke totalPrice
        totalPrice += itemPrice;

        // Buat item yang diperbarui dengan harga
        updatedItems.push({
          ...item,
          price: itemPrice, // Menambahkan price ke setiap item
        });
      }

      createTransactionDto.items = updatedItems;

      // Buat transaksi baru dengan updatedItems dan totalPrice
      const transaction = new this.transactionModel({
        userId,
        ...createTransactionDto, // Menggunakan items yang telah diperbarui dengan price
        totalPrice,
      });
      await transaction.save({ session });

      for (const item of transaction.items) {
        const stock = await this.stockModel
          .findById(item.stock)
          .session(session)
          .exec();

        if (!stock) {
          throw new NotFoundException('Stock not found');
        }

        if (stock.stock < item.quantity) {
          throw new BadRequestException(
            'Insufficient stock for product: ' + stock,
          );
        }
        stock.stock -= item.quantity;
        await stock.save({ session });
      }
      const cart = await this.cartModel
        .findOne({ userId })
        .session(session)
        .exec();
      if (!cart) {
        throw new NotFoundException('Cart not found');
      }
      for (const itemDto of createTransactionDto.items) {
        const itemIndex = cart.items.findIndex(
          (item) =>
            item.product._id.toString() === itemDto.product.toString() &&
            item.stock._id.toString() === itemDto.stock.toString(),
        );
        if (itemIndex !== -1) {
          const item = cart.items[itemIndex];
          item.quantity -= itemDto.quantity;

          if (item.quantity <= 0) {
            cart.items.splice(itemIndex, 1); // Hapus item dari cart
          } else {
            cart.items[itemIndex].quantity = item.quantity; // Perbarui quantity
          }
        }
      }

      await cart.save({ session });

      await session.commitTransaction();
      return transaction;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async findAll(): Promise<Transaction[]> {
    return this.transactionModel.find();
  }

  async findAllByUserId(userId: string): Promise<Transaction[]> {
    return this.transactionModel.find({ userId });
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionModel
      .aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
          },
        },
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
                price: {
                  $multiply: ['$items.product.price', '$items.quantity'],
                },
              },
            },
          },
        },
      ])
      .exec();

    if (!transaction.length) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction[0];
  }

  async update(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.transactionModel.findOne({ _id: id });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    // Cek apakah waktu yang berlalu sejak transaksi dibuat lebih dari 10 menit
    const now = new Date();
    const tenMinutes = 10 * 60 * 1000; // 10 menit dalam milidetik
    const timeElapsed = now.getTime() - transaction.createdDate.getTime();

    if (timeElapsed > tenMinutes) {
      throw new BadRequestException(
        'Transaction data cannot be changed after 10 minutes',
      );
    }
    await this.transactionModel.updateOne({ _id: id }, updateTransactionDto);
    return this.transactionModel.findOne({ _id: id });
  }

  async updateStatus(
    id: string,
    updateStatusTransactionDto: UpdateStatusTransactionDto,
  ): Promise<Transaction> {
    await this.findOne(id);
    await this.transactionModel.updateOne(
      { _id: id },
      updateStatusTransactionDto,
    );
    return this.transactionModel.findOne({ _id: id });
  }
}
