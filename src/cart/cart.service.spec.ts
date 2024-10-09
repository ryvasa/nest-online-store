import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { Cart } from './schema/cart.schema';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { CreateCartDto } from './dto/create-cart.dto';
import { Product } from 'src/products/interfaces/product.interface';
import { Stock } from 'src/stocks/interfaces/stock.interface';
import { UpdateCartDto } from './dto/update-cart.dto';

describe('CartService', () => {
  let service: CartService;
  let cartModel: Model<Cart>;

  const CART_MODEL_TOKEN = getModelToken('Cart');
  const mockProduct = {
    _id: 'someId',
    productName: 'Test Product',
    description: 'Test Description',
    price: 100,
    images: ['image1.jpg'],
    category: ['category1', 'category2'],
  };

  const mockStock = {
    _id: 'someId',
    product: mockProduct as Product,
    stock: 100,
    size: 'M',
    color: 'red',
    length: 100,
    width: 100,
    height: 100,
    weight: 100,
    image: 'image.jpg',
  };
  const mockCart = {
    _id: 'someId',
    userId: 'someId',
    items: [
      { product: mockProduct, stock: mockStock, quantity: 1, price: 100 },
    ],
    save: jest.fn(),
  };

  beforeEach(async () => {
    const mockModelFn = jest.fn().mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockCart),
    }));

    Object.assign(mockModelFn, {
      aggregate: jest.fn(),
      find: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      updateOne: jest.fn(),
    });
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: CART_MODEL_TOKEN,
          useValue: mockModelFn,
        },
      ],
    }).compile();

    cartModel = module.get<Model<Cart>>(CART_MODEL_TOKEN);
    service = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(cartModel).toBeDefined();
    expect(service).toBeDefined();
  });
  describe('addProductToCart', () => {
    it('should add product to new cart', async () => {
      jest.spyOn(cartModel, 'findOne').mockResolvedValue(null);
      const createCartDto: CreateCartDto = {
        product: mockProduct._id,
        stock: mockStock._id,
        quantity: 1,
      };
      const mockCartInstance = {
        ...createCartDto,
        _id: 'someId',
        save: jest.fn().mockResolvedValue({ ...createCartDto, _id: 'someId' }),
      };

      (cartModel as any).mockImplementation(() => mockCartInstance);
      const result = await service.addProductToCart('someId', createCartDto);

      expect(cartModel).toHaveBeenCalledWith({
        userId: 'someId',
        items: [createCartDto],
      });
      expect(mockCartInstance.save).toHaveBeenCalled();
      expect(result).toEqual({ ...createCartDto, _id: 'someId' });
    });

    it('should add new item to existing cart', async () => {
      const userId = 'someId';
      const updateCartDto: UpdateCartDto = {
        product: 'anotherId',
        stock: 'anotherId',
        quantity: 1,
      };

      const updatedCart = {
        _id: 'someCartId',
        userId,
        items: [
          ...mockCart.items,
          {
            product: { _id: updateCartDto.product },
            stock: { _id: updateCartDto.stock },
            quantity: updateCartDto.quantity,
          },
        ],
      };

      jest.spyOn(cartModel, 'findOne').mockResolvedValueOnce(mockCart as any);
      jest
        .spyOn(cartModel, 'findOneAndUpdate')
        .mockResolvedValueOnce(updatedCart as any);

      const result = await service.addProductToCart(userId, updateCartDto);

      expect(cartModel.findOne).toHaveBeenCalledWith({ userId });
      expect(cartModel.findOneAndUpdate).toHaveBeenCalledWith(
        { userId },
        { $push: { items: updateCartDto } },
        { new: true, runValidators: true },
      );
      expect(result).toEqual(updatedCart);
      expect(result.items).toHaveLength(mockCart.items.length + 1);
      expect(result.items[result.items.length - 1].product._id).toBe(
        updateCartDto.product,
      );
      expect(result.items[result.items.length - 1].stock._id).toBe(
        updateCartDto.stock,
      );
      expect(result.items[result.items.length - 1].quantity).toBe(
        updateCartDto.quantity,
      );
    });

    it('should update quantity and save when item exists', async () => {
      const userId = 'user123';
      const updateCartDto: UpdateCartDto = {
        product: mockProduct._id,
        stock: mockStock._id,
        quantity: 2,
      };

      const mockCartWithSave = {
        ...mockCart,
        items: [
          {
            product: { _id: mockProduct._id },
            stock: { _id: mockStock._id },
            quantity: 1,
          },
        ],
        save: jest.fn().mockResolvedValue({
          ...mockCart,
          items: [
            {
              product: { _id: mockProduct._id },
              stock: { _id: mockStock._id },
              quantity: 3,
            },
          ],
        }),
      };

      jest
        .spyOn(cartModel, 'findOne')
        .mockResolvedValue(mockCartWithSave as any);

      const result = await service.addProductToCart(userId, updateCartDto);

      expect(cartModel.findOne).toHaveBeenCalledWith({ userId });
      expect(mockCartWithSave.save).toHaveBeenCalled();
      expect(result.items[0].quantity).toBe(3);
    });
  });

  describe('findAllByUser', () => {
    it('should return an array of products in user cart', async () => {
      const mockAggregateResult = [mockCart];
      jest.spyOn(cartModel, 'aggregate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAggregateResult),
      } as any);

      const result = await service.findAllByUser('someId');

      expect(result).toEqual(mockCart);
      expect(cartModel.aggregate).toHaveBeenCalled();
    });

    it('should return a message when cart is empty', async () => {
      jest.spyOn(cartModel, 'aggregate').mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      } as any);

      const result = await service.findAllByUser('someId');

      expect(result).toEqual({
        message: "You don't have any products in your cart yet",
      });
      expect(cartModel.aggregate).toHaveBeenCalled();
    });
  });

  describe('countChatItems', () => {
    it('should return correct count when cart exists', async () => {
      const mockCart = {
        userId: 'someId',
        items: [{ quantity: 2 }, { quantity: 3 }, { quantity: 1 }],
      };

      jest.spyOn(cartModel, 'findOne').mockResolvedValue(mockCart as any);

      const result = await service.countChatItems('someId');

      expect(result).toEqual({ userId: 'someId', quantity: 6 });
      expect(cartModel.findOne).toHaveBeenCalledWith({ userId: 'someId' });
    });

    it('should return zero quantity when cart does not exist', async () => {
      jest.spyOn(cartModel, 'findOne').mockResolvedValue(null);

      const result = await service.countChatItems('someId');

      expect(result).toEqual({ userId: 'someId', quantity: 0 });
      expect(cartModel.findOne).toHaveBeenCalledWith({ userId: 'someId' });
    });

    it('should return zero quantity when cart has no items', async () => {
      const mockEmptyCart = {
        userId: 'someId',
        items: [],
      };

      jest.spyOn(cartModel, 'findOne').mockResolvedValue(mockEmptyCart as any);

      const result = await service.countChatItems('someId');

      expect(result).toEqual({ userId: 'someId', quantity: 0 });
      expect(cartModel.findOne).toHaveBeenCalledWith({ userId: 'someId' });
    });
  });

  describe('removeProductFromCart', () => {
    const userId = 'user123';
    const updateCartDto: UpdateCartDto = {
      product: 'product1',
      stock: 'stock1',
      quantity: 2,
    };

    it('should throw an error if cart is not found', async () => {
      jest.spyOn(cartModel, 'findOne').mockResolvedValueOnce(null);

      await expect(
        service.removeProductFromCart(userId, updateCartDto),
      ).rejects.toThrow('Cart not found');
    });

    it('should throw an error if item is not found in cart', async () => {
      const mockCart = {
        userId,
        items: [
          {
            product: { _id: 'otherProduct' },
            stock: { _id: 'otherStock' },
            quantity: 3,
          },
        ],
      };

      jest.spyOn(cartModel, 'findOne').mockResolvedValueOnce(mockCart as any);

      await expect(
        service.removeProductFromCart(userId, updateCartDto),
      ).rejects.toThrow('Item not found in cart');
    });

    it('should remove item from cart if quantity becomes zero or negative', async () => {
      const mockCart = {
        userId,
        items: [
          {
            product: { _id: 'product1' },
            stock: { _id: 'stock1' },
            quantity: 2,
          },
        ],
      };

      jest.spyOn(cartModel, 'findOne').mockResolvedValueOnce(mockCart as any);
      const updateOneSpy = jest
        .spyOn(cartModel, 'updateOne')
        .mockResolvedValueOnce({} as any);

      await service.removeProductFromCart(userId, updateCartDto);

      expect(updateOneSpy).toHaveBeenCalledWith(
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
    });

    it('should update item quantity if it remains positive', async () => {
      const mockCart = {
        userId,
        items: [
          {
            product: { _id: 'product1' },
            stock: { _id: 'stock1' },
            quantity: 5,
          },
        ],
      };

      jest.spyOn(cartModel, 'findOne').mockResolvedValueOnce(mockCart as any);
      const updateOneSpy = jest
        .spyOn(cartModel, 'updateOne')
        .mockResolvedValueOnce({} as any);

      await service.removeProductFromCart(userId, updateCartDto);

      expect(updateOneSpy).toHaveBeenCalledWith(
        {
          userId,
          'items.product': updateCartDto.product,
          'items.stock': updateCartDto.stock,
        },
        { $set: { 'items.$.quantity': 3 } },
      );
    });

    it('should return updated cart after removing product', async () => {
      const mockCart = {
        userId,
        items: [
          {
            product: { _id: 'product1' },
            stock: { _id: 'stock1' },
            quantity: 5,
          },
        ],
      };

      const updatedCart = {
        userId,
        items: [
          {
            product: { _id: 'product1' },
            stock: { _id: 'stock1' },
            quantity: 3,
          },
        ],
      };

      jest
        .spyOn(cartModel, 'findOne')
        .mockResolvedValueOnce(mockCart as any)
        .mockResolvedValueOnce(updatedCart as any);
      jest.spyOn(cartModel, 'updateOne').mockResolvedValueOnce({} as any);

      const result = await service.removeProductFromCart(userId, updateCartDto);

      expect(result).toEqual(updatedCart);
    });
  });
});
