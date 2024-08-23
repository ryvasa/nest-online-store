import { Injectable } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Cart } from './interfaces/cart.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CartService {
  constructor(@InjectModel('Cart') private readonly cartModel: Model<Cart>) {}
  async create(userId: string, createCartDto: CreateCartDto): Promise<Cart> {
    const newCart = new this.cartModel({ userId, items: [createCartDto] });
    return newCart.save();
  }

  async findAllByUser(userId: string): Promise<Cart | object> {
    const cart = await this.cartModel.aggregate([
      {
        $match: { userId },
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
      {
        $limit: 1,
      },
    ]);
    return cart;
  }

  findOne(id: number) {
    return `This action returns a #${id} cart`;
  }

  update(id: number, updateCartDto: UpdateCartDto) {
    return `This action updates a #${id} cart`;
  }

  remove(id: number) {
    return `This action removes a #${id} cart`;
  }
}
