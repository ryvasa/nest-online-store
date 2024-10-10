import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { Model } from 'mongoose';
import { Status, Transactions } from './schema/transaction.schema';
import { Cart } from 'src/cart/schema/cart.schema';
import { Product } from 'src/products/schema/product.schema';
import { Stock } from 'src/stocks/schema/stock.schema';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  UpdateStatusTransactionDto,
  UpdateTransactionDto,
} from './dto/update-transaction.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let transactionModel: Model<Transactions>;
  let cartModel: Model<Cart>;
  let productModel: Model<Product>;
  let stockModel: Model<Stock>;
  let connection: Partial<mongoose.Connection>;

  const TRANSACTION_MODEL_TOKEN = getModelToken('Transaction');
  const CART_MODEL_TOKEN = getModelToken('Cart');
  const PRODUCT_MODEL_TOKEN = getModelToken('Product');
  const STOCK_MODEL_TOKEN = getModelToken('Stock');

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
    product: mockProduct,
    stock: 100,
    size: 'M',
    color: 'red',
    length: 100,
    width: 100,
    height: 100,
    weight: 100,
    image: 'image.jpg',
    save: jest.fn(),
  };

  const mockTransaction = {
    _id: 'someId',
    userId: 'someId',
    address: 'someAddress',
    status: 'someStatus',
    items: [
      {
        product: { _id: 'someId' },
        stock: { _id: 'someId' },
        quantity: 1,
        price: 100,
      },
    ],
    save: jest.fn(),
    deleteOne: jest.fn(),
  };

  const mockCart = {
    userId: 'user123',
    items: [
      {
        product: mockProduct,
        stock: mockStock,
        quantity: 3,
        price: mockProduct.price,
      },
    ],
    save: jest.fn(),
  };

  const mockSession = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const mockModelFn = jest.fn().mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockTransaction),
    }));

    Object.assign(mockModelFn, {
      aggregate: jest.fn(),
      find: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      updateOne: jest.fn(),
      prototype: {
        save: jest.fn().mockResolvedValue(mockTransaction),
      },
    });

    jest.spyOn(Date, 'now').mockImplementation(() => 1625097600000); // 1 Juli 2021 00:00:00 UTC
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: TRANSACTION_MODEL_TOKEN,
          useValue: mockModelFn,
        },
        {
          provide: CART_MODEL_TOKEN,
          useValue: {
            findOne: jest.fn(),
            session: jest.fn(),
          },
        },
        {
          provide: PRODUCT_MODEL_TOKEN,
          useValue: {
            findById: jest.fn(),
            session: jest.fn(),
          },
        },
        {
          provide: STOCK_MODEL_TOKEN,
          useValue: {
            findById: jest.fn(),
            session: jest.fn(),
          },
        },
        {
          provide: getConnectionToken(),
          useValue: {
            startSession: jest.fn().mockResolvedValue({
              startTransaction: jest.fn(),
              commitTransaction: jest.fn(),
              abortTransaction: jest.fn(),
              endSession: jest.fn(),
            }),
          },
        },
      ],
    }).compile();

    transactionModel = module.get<Model<Transactions>>(TRANSACTION_MODEL_TOKEN);
    cartModel = module.get<Model<Cart>>(CART_MODEL_TOKEN);
    productModel = module.get<Model<Product>>(PRODUCT_MODEL_TOKEN);
    stockModel = module.get<Model<Stock>>(STOCK_MODEL_TOKEN);
    service = module.get<TransactionsService>(TransactionsService);
    connection = module.get(getConnectionToken());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(transactionModel).toBeDefined();
    expect(cartModel).toBeDefined();
    expect(productModel).toBeDefined();
    expect(stockModel).toBeDefined();
    expect(connection).toBeDefined();
  });

  describe('create', () => {
    beforeEach(async () => {
      mockStock.stock = 100;
      jest.clearAllMocks();
    });
    const userId = 'user123';
    const createTransactionDto: CreateTransactionDto = {
      items: [
        {
          product: mockProduct._id as any,
          stock: mockStock._id as any,
          quantity: 2,
          price: 0,
        },
      ],
      address: 'Test Address',
    };

    it('should create a new transaction successfully', async () => {
      jest
        .spyOn(connection, 'startSession')
        .mockResolvedValue(mockSession as any);

      jest.spyOn(productModel, 'findById').mockReturnValue({
        session: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockProduct),
      } as any);

      jest.spyOn(stockModel, 'findById').mockReturnValue({
        ...mockStock,
        session: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockStock),
      } as any);

      jest.spyOn(cartModel, 'findOne').mockReturnValue({
        ...mockCart,
        session: jest.fn().mockReturnThis(),
        save: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCart),
      } as any);

      const mockTransactionInstance = {
        ...createTransactionDto,
        userId,
        totalPrice: 200,
        items: [{ ...createTransactionDto.items[0], price: 200 }],
        save: jest.fn().mockResolvedValue({
          _id: 'transaction123',
          userId,
          ...createTransactionDto,
          items: [{ ...createTransactionDto.items[0], price: 200 }],
          totalPrice: 200,
        }),
      };

      (transactionModel as any).mockImplementation(
        () => mockTransactionInstance,
      );
      const result = await service.create(userId, createTransactionDto);

      expect(mockCart.items[0].quantity).toBe(1);
      expect(connection.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(productModel.findById).toHaveBeenCalledWith(mockProduct._id);
      expect(stockModel.findById).toHaveBeenCalledWith(mockStock._id);
      expect(cartModel.findOne).toHaveBeenCalledWith({ userId });
      expect(mockTransactionInstance.save).toHaveBeenCalled();
      expect(mockStock.save).toHaveBeenCalled();
      expect(mockStock.stock).toBe(98);
      expect(mockCart.save).toHaveBeenCalled();
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
      expect(result).toEqual(mockTransactionInstance);
    });

    it('should create a new transaction successfully, delete item from cart if quantity is 0', async () => {
      const createTransactionDto: CreateTransactionDto = {
        items: [
          {
            product: mockProduct._id as any,
            stock: mockStock._id as any,
            quantity: 3,
            price: 0,
          },
        ],
        address: 'Test Address',
      };
      jest
        .spyOn(connection, 'startSession')
        .mockResolvedValue(mockSession as any);

      jest.spyOn(productModel, 'findById').mockReturnValue({
        session: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockProduct),
      } as any);

      jest.spyOn(stockModel, 'findById').mockReturnValue({
        ...mockStock,
        session: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockStock),
      } as any);

      jest.spyOn(cartModel, 'findOne').mockReturnValue({
        ...mockCart,
        session: jest.fn().mockReturnThis(),
        save: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCart),
      } as any);

      const mockTransactionInstance = {
        ...createTransactionDto,
        userId,
        totalPrice: 200,
        items: [{ ...createTransactionDto.items[0], price: 200 }],
        save: jest.fn().mockResolvedValue({
          _id: 'transaction123',
          userId,
          ...createTransactionDto,
          items: [{ ...createTransactionDto.items[0], price: 200 }],
          totalPrice: 200,
        }),
      };

      (transactionModel as any).mockImplementation(
        () => mockTransactionInstance,
      );
      const result = await service.create(userId, createTransactionDto);
      expect(mockCart.items.length).toBe(0);
      expect(connection.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(productModel.findById).toHaveBeenCalledWith(mockProduct._id);
      expect(stockModel.findById).toHaveBeenCalledWith(mockStock._id);
      expect(cartModel.findOne).toHaveBeenCalledWith({ userId });
      expect(mockTransactionInstance.save).toHaveBeenCalled();
      expect(mockStock.save).toHaveBeenCalled();
      expect(mockStock.stock).toBe(97);
      expect(mockCart.save).toHaveBeenCalled();
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
      expect(result).toEqual(mockTransactionInstance);
    });

    it('should throw NotFoundException if product is not found', async () => {
      jest
        .spyOn(connection, 'startSession')
        .mockResolvedValue(mockSession as any);
      jest.spyOn(productModel, 'findById').mockReturnValue({
        session: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(
        service.create(userId, createTransactionDto),
      ).rejects.toThrow(NotFoundException);
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('should throw NotFoundException if stock is not found', async () => {
      jest
        .spyOn(connection, 'startSession')
        .mockResolvedValue(mockSession as any);

      jest.spyOn(productModel, 'findById').mockReturnValue({
        session: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockProduct),
      } as any);

      jest.spyOn(stockModel, 'findById').mockReturnValue({
        session: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      const mockTransactionInstance = {
        ...createTransactionDto,
        userId,
        totalPrice: 200,
        items: [{ ...createTransactionDto.items[0], price: 200 }],
        save: jest.fn().mockResolvedValue({
          _id: 'transaction123',
          userId,
          ...createTransactionDto,
          items: [{ ...createTransactionDto.items[0], price: 200 }],
          totalPrice: 200,
        }),
      };

      (transactionModel as any).mockImplementation(
        () => mockTransactionInstance,
      );
      await expect(
        service.create(userId, createTransactionDto),
      ).rejects.toThrow(NotFoundException);
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('should throw BadRequestException if insufficient stock', async () => {
      const mockStock = { _id: 'stock123', stock: 1 };

      jest
        .spyOn(connection, 'startSession')
        .mockResolvedValue(mockSession as any);

      jest.spyOn(productModel, 'findById').mockReturnValue({
        session: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockProduct),
      } as any);

      jest.spyOn(stockModel, 'findById').mockReturnValue({
        ...mockStock,
        session: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockStock),
      } as any);

      jest.spyOn(cartModel, 'findOne').mockReturnValue({
        ...mockCart,
        session: jest.fn().mockReturnThis(),
        save: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCart),
      } as any);

      const mockTransactionInstance = {
        ...createTransactionDto,
        userId,
        totalPrice: 200,
        items: [{ ...createTransactionDto.items[0], price: 200 }],
        save: jest.fn().mockResolvedValue({
          _id: 'transaction123',
          userId,
          ...createTransactionDto,
          items: [{ ...createTransactionDto.items[0], price: 200 }],
          totalPrice: 200,
        }),
      };

      (transactionModel as any).mockImplementation(
        () => mockTransactionInstance,
      );

      await expect(
        service.create(userId, createTransactionDto),
      ).rejects.toThrow(BadRequestException);
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('should throw NotFoundException if cart is not found', async () => {
      jest
        .spyOn(connection, 'startSession')
        .mockResolvedValue(mockSession as any);

      jest.spyOn(productModel, 'findById').mockReturnValue({
        session: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockProduct),
      } as any);

      jest.spyOn(stockModel, 'findById').mockReturnValue({
        ...mockStock,
        session: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockStock),
      } as any);

      jest.spyOn(cartModel, 'findOne').mockReturnValue({
        ...mockCart,
        session: jest.fn().mockReturnThis(),
        save: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      const mockTransactionInstance = {
        ...createTransactionDto,
        userId,
        totalPrice: 200,
        items: [{ ...createTransactionDto.items[0], price: 200 }],
        save: jest.fn().mockResolvedValue({
          _id: 'transaction123',
          userId,
          ...createTransactionDto,
          items: [{ ...createTransactionDto.items[0], price: 200 }],
          totalPrice: 200,
        }),
      };

      (transactionModel as any).mockImplementation(
        () => mockTransactionInstance,
      );

      await expect(
        service.create(userId, createTransactionDto),
      ).rejects.toThrow(NotFoundException);
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of transactions', async () => {
      jest.spyOn(transactionModel, 'find').mockResolvedValue([mockTransaction]);

      const result = await service.findAll();
      expect(result).toEqual([mockTransaction]);
      expect(transactionModel.find).toHaveBeenCalled();
    });
  });

  describe('findAllByUserId', () => {
    it('should return an array of transactions', async () => {
      jest.spyOn(transactionModel, 'find').mockResolvedValue([mockTransaction]);
      const result = await service.findAllByUserId('someId');
      expect(result).toEqual([mockTransaction]);
      expect(transactionModel.find).toHaveBeenCalledWith({ userId: 'someId' });
    });
  });

  describe('findOne', () => {
    const validId = '507f1f77bcf86cd799439011';

    it('should return a transaction when found', async () => {
      const mockAggregateResult = [
        {
          _id: validId,
          userId: 'userId',
          address: 'someAddress',
          status: 'someStatus',
          items: [
            {
              product: {
                _id: 'productId',
                name: 'Product Name',
                price: 100,
              },
              stock: {
                _id: 'stockId',
                size: 'M',
                color: 'Red',
              },
              quantity: 2,
              price: 200,
            },
          ],
        },
      ];

      jest.spyOn(transactionModel, 'aggregate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAggregateResult),
      } as any);

      const result = await service.findOne(validId);

      expect(result).toEqual(mockAggregateResult[0]);
      expect(transactionModel.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          { $match: { _id: new mongoose.Types.ObjectId(validId) } },
          { $unwind: '$items' },
          { $lookup: expect.any(Object) },
          { $unwind: '$items.product' },
          { $lookup: expect.any(Object) },
          { $unwind: '$items.stock' },
          { $group: expect.any(Object) },
        ]),
      );
    });

    it('should throw NotFoundException when transaction is not found', async () => {
      jest.spyOn(transactionModel, 'aggregate').mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      } as any);

      await expect(service.findOne(validId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const validId = '507f1f77bcf86cd799439011'; // ID MongoDB yang valid
    const updateTransactionDto: UpdateTransactionDto = {
      address: 'new address',
    };

    it('should update a transaction if within 10 minutes', async () => {
      const mockNow = new Date('2021-07-01T00:00:00Z');
      const mockCreatedDate = new Date('2021-07-01T00:05:00Z'); // 5 menit sebelumnya

      jest.spyOn(global, 'Date').mockImplementation(() => mockNow as any);

      const mockTransaction = {
        _id: validId,
        createdDate: mockCreatedDate,
      };

      jest
        .spyOn(transactionModel, 'findOne')
        .mockResolvedValueOnce(mockTransaction as any)
        .mockResolvedValueOnce({
          ...mockTransaction,
          ...updateTransactionDto,
        } as any);

      jest
        .spyOn(transactionModel, 'updateOne')
        .mockResolvedValueOnce({ nModified: 1 } as any);

      const result = await service.update(validId, updateTransactionDto);

      expect(transactionModel.findOne).toHaveBeenCalledWith({ _id: validId });
      expect(transactionModel.updateOne).toHaveBeenCalledWith(
        { _id: validId },
        updateTransactionDto,
      );
      expect(result).toEqual(expect.objectContaining(updateTransactionDto));
    });

    it('should throw NotFoundException if transaction not found', async () => {
      jest.spyOn(transactionModel, 'findOne').mockResolvedValueOnce(null);

      await expect(
        service.update(validId, updateTransactionDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if more than 10 minutes have passed', async () => {
      const mockTransaction = {
        _id: validId,
        createdDate: new Date(1625096940000), // 11 menit sebelum waktu yang di-mock
      };

      jest
        .spyOn(transactionModel, 'findOne')
        .mockResolvedValueOnce(mockTransaction as any);

      await expect(
        service.update(validId, updateTransactionDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw an error for invalid ID format', async () => {
      await expect(
        service.update('invalidId', updateTransactionDto),
      ).rejects.toThrow();
    });
  });

  describe('updateStatus', () => {
    const validId = '507f1f77bcf86cd799439011'; // ID MongoDB yang valid
    const updateStatusTransactionDto: UpdateStatusTransactionDto = {
      status: Status.SUCCESS,
    };

    it('should update a transaction status', async () => {
      const mockTransaction = {
        _id: validId,
        status: Status.PROCESS,
        // ... properti lain yang diperlukan
      };

      // Mock untuk findOne (dipanggil oleh this.findOne(id))
      jest
        .spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockTransaction as any);

      // Mock untuk updateOne
      jest
        .spyOn(transactionModel, 'updateOne')
        .mockResolvedValueOnce({ nModified: 1 } as any);

      // Mock untuk findOne yang kedua (dipanggil setelah updateOne)
      jest.spyOn(transactionModel, 'findOne').mockResolvedValueOnce({
        ...mockTransaction,
        status: Status.SUCCESS,
      } as any);

      const result = await service.updateStatus(
        validId,
        updateStatusTransactionDto,
      );

      expect(service.findOne).toHaveBeenCalledWith(validId);
      expect(transactionModel.updateOne).toHaveBeenCalledWith(
        { _id: validId },
        updateStatusTransactionDto,
      );
      expect(transactionModel.findOne).toHaveBeenCalledWith({ _id: validId });
      expect(result).toEqual(
        expect.objectContaining({ status: Status.SUCCESS }),
      );
    });

    it('should throw NotFoundException if transaction not found', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValueOnce(new NotFoundException('Transaction not found'));

      await expect(
        service.updateStatus(validId, updateStatusTransactionDto),
      ).rejects.toThrow(NotFoundException);

      expect(service.findOne).toHaveBeenCalledWith(validId);
    });
  });
});
