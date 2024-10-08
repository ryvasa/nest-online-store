import { Test, TestingModule } from '@nestjs/testing';
import { StocksService } from './stocks.service';
import { ProductsService } from 'src/products/products.service';
import { Stock } from './schema/stock.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

describe('StocksService', () => {
  let service: StocksService;
  let productService: ProductsService;
  let stockModel: Model<Stock>;

  const mockProduct = {
    _id: 'someId',
    productName: 'Test Product',
    description: 'Test Description',
    price: 100,
    images: ['image1.jpg'],
    save: jest.fn(),
    deleteOne: jest.fn(),
  };

  const mockStock = {
    _id: 'someId',
    productName: 'Test Product',
    description: 'Test Description',
    price: 100,
    images: ['image1.jpg'],
    save: jest.fn(),
    deleteOne: jest.fn(),
  };
  const STOCK_MODEL_TOKEN = getModelToken('Stocks');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StocksService,
        {
          provide: STOCK_MODEL_TOKEN,
          useValue: {
            new: jest.fn().mockResolvedValue(mockStock),
            constructor: jest.fn().mockResolvedValue(mockStock),
            find: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
        {
          provide: ProductsService,
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockProduct),
          },
        },
      ],
    }).compile();

    productService = module.get<ProductsService>(ProductsService);
    stockModel = module.get<Model<Stock>>(STOCK_MODEL_TOKEN);
    service = module.get<StocksService>(StocksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(productService).toBeDefined();
    expect(stockModel).toBeDefined();
  });
});
