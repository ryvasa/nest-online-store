import { Test, TestingModule } from '@nestjs/testing';
import { StocksService } from './stocks.service';
import { ProductsService } from 'src/products/products.service';
import { Stock } from './schema/stock.schema';
import { Stock as StockInterface } from './interfaces/stock.interface';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateStockDto } from './dto/create-stock.dto';
import { NotFoundException } from '@nestjs/common';
import { Product } from 'src/products/interfaces/product.interface';
import { UpdateStockDto } from './dto/update-stock.dto';

describe('StocksService', () => {
  let stockService: StocksService;
  let productService: ProductsService;
  let stockModel: Model<Stock>;

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
    product: 'someId',
    stock: '100',
    size: 'M',
    color: 'red',
    length: 100,
    width: 100,
    height: 100,
    weight: 100,
    image: 'image.jpg',
    save: jest.fn(),
    deleteOne: jest.fn(),
  };
  const STOCK_MODEL_TOKEN = getModelToken('Stocks');

  beforeEach(async () => {
    const mockModelFn = jest.fn().mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockStock),
    }));

    Object.assign(mockModelFn, {
      find: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      findOne: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StocksService,
        {
          provide: STOCK_MODEL_TOKEN,
          useValue: mockModelFn,
        },
        {
          provide: ProductsService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    productService = module.get<ProductsService>(ProductsService);
    stockModel = module.get<Model<Stock>>(STOCK_MODEL_TOKEN);
    stockService = module.get<StocksService>(StocksService);
  });

  it('should be defined', () => {
    expect(stockService).toBeDefined();
    expect(productService).toBeDefined();
    expect(stockModel).toBeDefined();
  });

  describe('createStock', () => {
    it('should create a new stock', async () => {
      const createStockDto: CreateStockDto = {
        product: 'someId',
        stock: '100',
        size: 'M',
        color: 'red',
        length: 100,
        width: 100,
        height: 100,
        weight: 100,
        image: 'image.jpg',
      };
      const mockProductInstance = {
        ...createStockDto,
        _id: 'someId',
        save: jest.fn().mockResolvedValue({ ...createStockDto, _id: 'someId' }),
      };

      (stockModel as any).mockImplementation(() => mockProductInstance);
      const result = await stockService.create(createStockDto);

      expect(stockModel).toHaveBeenCalledWith(createStockDto);
      expect(mockProductInstance.save).toHaveBeenCalled();
      expect(result).toEqual({ ...createStockDto, _id: 'someId' });
    });
  });

  describe('findAll', () => {
    it('should return an array of stocks', async () => {
      const mockStocks = [mockStock];
      jest.spyOn(stockModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockStocks),
      } as any);
      const result = await stockService.findAll();
      expect(result).toEqual(mockStocks);
      expect(stockModel.find).toHaveBeenCalled();
    });
  });

  describe('findAllByProductId', () => {
    const mockStocks = [mockStock];

    it('should return an array of stocks if product found', async () => {
      jest.spyOn(stockModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockStocks),
      } as any);

      jest
        .spyOn(productService, 'findOne')
        .mockResolvedValueOnce(mockProduct as Product);

      const result = await stockService.findAllByProductId('someId');

      expect(result).toEqual(mockStocks);
      expect(stockModel.find).toHaveBeenCalledWith({ product: 'someId' });
      expect(productService.findOne).toHaveBeenCalledWith('someId');
    });

    it('should throw NotFoundException if product not found', async () => {
      jest
        .spyOn(productService, 'findOne')
        .mockRejectedValueOnce(new NotFoundException('Product not found'));

      await expect(stockService.findAllByProductId('someId')).rejects.toThrow(
        NotFoundException,
      );

      expect(productService.findOne).toHaveBeenCalledWith('someId');
      expect(stockModel.find).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a stock if found', async () => {
      jest
        .spyOn(productService, 'findOne')
        .mockResolvedValueOnce(mockProduct as Product);

      jest.spyOn(stockModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockStock),
      } as any);

      const result = await stockService.findOne('someId', 'someId');
      expect(result).toEqual(mockStock);
      expect(stockModel.findById).toHaveBeenCalledWith('someId');
      expect(productService.findOne).toHaveBeenCalledWith('someId');
    });
    it('should throw NotFoundException if product not found', async () => {
      jest
        .spyOn(productService, 'findOne')
        .mockRejectedValueOnce(new NotFoundException('Product not found'));

      await expect(stockService.findOne('someId', 'someId')).rejects.toThrow(
        NotFoundException,
      );
      expect(productService.findOne).toHaveBeenCalledWith('someId');
      expect(stockModel.findById).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if stock not found', async () => {
      jest
        .spyOn(productService, 'findOne')
        .mockResolvedValueOnce(mockProduct as Product);

      jest.spyOn(stockModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(stockService.findOne('someId', 'someId')).rejects.toThrow(
        NotFoundException,
      );
      expect(productService.findOne).toHaveBeenCalledWith('someId');
      expect(stockModel.findById).toHaveBeenCalledWith('someId');
    });
  });

  describe('updateStock', () => {
    it('should update a stock', async () => {
      const updateStockDto: UpdateStockDto = {
        product: 'someId',
        stock: '100',
        size: 'M',
        color: 'red',
        length: 100,
        width: 100,
        height: 100,
        weight: 100,
        image: 'image.jpg',
      };

      const mockUpdatedStock = {
        ...updateStockDto,
        _id: 'someId',
        save: jest.fn().mockResolvedValue({ ...updateStockDto, _id: 'someId' }),
      };

      jest
        .spyOn(productService, 'findOne')
        .mockResolvedValueOnce(mockProduct as Product);

      jest.spyOn(stockService, 'findOne').mockResolvedValueOnce({
        ...mockStock,
        save: jest.fn().mockResolvedValue(mockUpdatedStock),
      } as unknown as StockInterface);

      const result = await stockService.update(updateStockDto, 'someId');

      expect(productService.findOne).toHaveBeenCalledWith('someId');
      expect(stockService.findOne).toHaveBeenCalledWith('someId', 'someId');
      expect(result).toEqual(mockUpdatedStock);
    });

    it('should throw NotFoundException if product not found', async () => {
      const updateStockDto: UpdateStockDto = {
        product: 'nonExistentId',
        stock: '100',
      };

      jest
        .spyOn(productService, 'findOne')
        .mockRejectedValueOnce(new NotFoundException('Product not found'));

      await expect(
        stockService.update(updateStockDto, 'someId'),
      ).rejects.toThrow(NotFoundException);
      expect(productService.findOne).toHaveBeenCalledWith('nonExistentId');
    });

    it('should throw NotFoundException if stock not found', async () => {
      const updateStockDto: UpdateStockDto = {
        product: 'someId',
        stock: '100',
      };

      jest
        .spyOn(productService, 'findOne')
        .mockResolvedValueOnce(mockProduct as Product);
      jest
        .spyOn(stockService, 'findOne')
        .mockRejectedValueOnce(new NotFoundException('Stock not found'));

      await expect(
        stockService.update(updateStockDto, 'nonExistentStockId'),
      ).rejects.toThrow(NotFoundException);
      expect(productService.findOne).toHaveBeenCalledWith('someId');
      expect(stockService.findOne).toHaveBeenCalledWith(
        'someId',
        'nonExistentStockId',
      );
    });
  });

  describe('remove', () => {
    it('should remove a stock successfully', async () => {
      const productId = 'someProductId';
      const stockId = 'someStockId';
      const mockStock = {
        _id: stockId,
        product: productId,
        deleteOne: jest.fn().mockResolvedValue(undefined),
      };

      jest
        .spyOn(productService, 'findOne')
        .mockResolvedValueOnce(mockProduct as Product);
      jest
        .spyOn(stockService, 'findOne')
        .mockResolvedValueOnce(mockStock as unknown as StockInterface);

      const result = await stockService.remove(productId, stockId);

      expect(productService.findOne).toHaveBeenCalledWith(productId);
      expect(stockService.findOne).toHaveBeenCalledWith(productId, stockId);
      expect(mockStock.deleteOne).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Stock has been deleted' });
    });

    it('should throw NotFoundException if product not found', async () => {
      const productId = 'nonExistentProductId';
      const stockId = 'someStockId';

      jest
        .spyOn(productService, 'findOne')
        .mockRejectedValueOnce(new NotFoundException('Product not found'));

      await expect(stockService.remove(productId, stockId)).rejects.toThrow(
        NotFoundException,
      );
      expect(productService.findOne).toHaveBeenCalledWith(productId);
    });

    it('should throw NotFoundException if stock not found', async () => {
      const productId = 'someProductId';
      const stockId = 'nonExistentStockId';

      jest
        .spyOn(productService, 'findOne')
        .mockResolvedValueOnce(mockProduct as Product);
      jest
        .spyOn(stockService, 'findOne')
        .mockRejectedValueOnce(new NotFoundException('Stock not found'));

      await expect(stockService.remove(productId, stockId)).rejects.toThrow(
        NotFoundException,
      );
      expect(productService.findOne).toHaveBeenCalledWith(productId);
      expect(stockService.findOne).toHaveBeenCalledWith(productId, stockId);
    });
  });
});
