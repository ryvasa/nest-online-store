import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { Model } from 'mongoose';
import { Transactions } from './schema/transaction.schema';
import { Cart } from 'src/cart/schema/cart.schema';
import { Product } from 'src/products/schema/product.schema';
import { Stock } from 'src/stocks/schema/stock.schema';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

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

  const mockTransaction = {
    _id: 'someId',
    userId: 'someId',
    address: 'someAddress',
    status: 'someStatus',
    items: [
      {
        product: 'someId',
        stock: 'someId',
        quantity: 1,
        price: 100,
      },
    ],
    save: jest.fn(),
    deleteOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: TRANSACTION_MODEL_TOKEN,
          useValue: {
            new: jest.fn().mockResolvedValue(mockTransaction),
            constructor: jest.fn().mockResolvedValue(mockTransaction),
            aggregate: jest.fn(),
            findOne: jest.fn(),
            updateOne: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(transactionModel).toBeDefined();
    expect(cartModel).toBeDefined();
    expect(productModel).toBeDefined();
    expect(stockModel).toBeDefined();
  });
});
