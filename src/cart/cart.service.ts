import { Injectable } from '@nestjs/common';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Cart } from './interfaces/cart.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CartService {
  constructor(@InjectModel('Cart') private readonly cartModel: Model<Cart>) {}
  // async create(userId: string, createCartDto: CreateCartDto): Promise<Cart> {
  //   const newCart = new this.cartModel({ userId, items: [createCartDto] });
  //   return newCart.save();
  // }
  async addProductToCart(
    userId: string,
    updateCartDto: UpdateCartDto,
  ): Promise<Cart> {
    const cart = await this.cartModel.findOne({ userId });
    if (!cart) {
      const newCart = new this.cartModel({ userId, items: [updateCartDto] });
      return newCart.save();
    }
    const item = cart.items.find(
      (item) =>
        item.product._id.toString() === updateCartDto.product &&
        item.stock._id.toString() === updateCartDto.stock,
    );
    if (item) {
      item.quantity += updateCartDto.quantity;
      return cart.save();
    } else {
      const cart = await this.cartModel.findOneAndUpdate(
        { userId },
        { $push: { items: updateCartDto } },
      );
      cart.save();
      return await this.cartModel.findOne({ userId });
    }
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
    if (!cart.length) {
      return { message: `You don't have any products in your cart yet` };
    } else {
      return cart[0];
    }
  }

  async countChatItems(userId: string) {
    const cart = await this.cartModel.findOne({ userId });
    const totalQuantity = !cart
      ? 0
      : cart.items.reduce(
          (accumulator, item) => accumulator + item.quantity,
          0,
        );
    return { userId, quantity: totalQuantity };
  }

  async removeProductFromCart(
    userId: string,
    updateCartDto: UpdateCartDto,
  ): Promise<Cart | null> {
    const cart = await this.cartModel.findOne({ userId });
    if (!cart) {
      throw new Error('Cart not found');
    }

    const item = cart.items.find(
      (item) =>
        item.product._id.toString() === updateCartDto.product &&
        item.stock._id.toString() === updateCartDto.stock,
    );

    if (item) {
      item.quantity -= updateCartDto.quantity;

      if (item.quantity <= 0) {
        await this.cartModel.updateOne(
          { userId },
          {
            $pull: {
              items: {
                product: updateCartDto.product,
                stock: updateCartDto.stock,
              },
            },
          },
        );
      } else {
        await this.cartModel.updateOne(
          {
            userId,
            'items.product': updateCartDto.product,
            'items.stock': updateCartDto.stock,
          },
          { $set: { 'items.$.quantity': item.quantity } },
        );
      }

      return await this.cartModel.findOne({ userId });
    } else {
      throw new Error('Item not found in cart');
    }
  }
}
