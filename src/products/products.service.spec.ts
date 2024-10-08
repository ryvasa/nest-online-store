import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './schema/product.schema';

describe('ProductsService', () => {
  let service: ProductsService;
  let model: Model<Product>;

  const mockProduct = {
    _id: 'someId',
    productName: 'Test Product',
    description: 'Test Description',
    price: 100,
    images: ['image1.jpg'],
    save: jest.fn(),
    deleteOne: jest.fn(),
  };

  const PRODUCT_MODEL_TOKEN = getModelToken('Products');
  beforeEach(async () => {
    const mockModelFn = jest.fn().mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockProduct),
    }));

    Object.assign(mockModelFn, {
      find: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PRODUCT_MODEL_TOKEN,
          useValue: mockModelFn,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    model = module.get<Model<Product>>(PRODUCT_MODEL_TOKEN);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(model).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createProductDto: CreateProductDto = {
        productName: 'Test Product',
        description: 'Test Description',
        material: 'Test Material',
        category: ['Test Category'],
        price: 100,
        images: ['image1.jpg'],
      };

      const mockProductInstance = {
        ...createProductDto,
        _id: 'someId',
        save: jest
          .fn()
          .mockResolvedValue({ ...createProductDto, _id: 'someId' }),
      };

      (model as any).mockImplementation(() => mockProductInstance);

      const result = await service.create(createProductDto);

      expect(model).toHaveBeenCalledWith(createProductDto);
      expect(mockProductInstance.save).toHaveBeenCalled();
      expect(result).toEqual({ ...createProductDto, _id: 'someId' });
    });

    it('should throw BadRequestException if no images are provided', async () => {
      const createProductDto: CreateProductDto = {
        productName: 'Test Product',
        description: 'Test Description',
        material: 'Test Material',
        category: ['Test Category'],
        price: 100,
        images: [],
      };

      await expect(service.create(createProductDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of products with pagination and search', async () => {
      const mockProducts = [mockProduct];
      jest.spyOn(model, 'find').mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(mockProducts),
      } as any);

      const result = await service.findAll({
        productName: 'Test Product',
        take: 10,
        skip: 0,
      });
      expect(result).toEqual(mockProducts);
    });
    it('should return an array of products without pagination and search', async () => {
      const mockProducts = [mockProduct];
      jest.spyOn(model, 'find').mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(mockProducts),
      } as any);

      const result = await service.findAll({});
      expect(result).toEqual(mockProducts);
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      jest.spyOn(model, 'findById').mockResolvedValueOnce(mockProduct as any);

      const result = await service.findOne('someId');
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product is not found', async () => {
      jest.spyOn(model, 'findById').mockResolvedValueOnce(null);

      await expect(service.findOne('someId')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateProductDto: UpdateProductDto = { price: 200 };
      const updatedProduct = { ...mockProduct, ...updateProductDto };

      jest.spyOn(model, 'findById').mockResolvedValueOnce(mockProduct as any);
      jest
        .spyOn(mockProduct, 'save')
        .mockResolvedValueOnce(updatedProduct as any);

      const result = await service.update('someId', updateProductDto);
      expect(result).toEqual(updatedProduct);
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      jest.spyOn(model, 'findById').mockResolvedValueOnce(mockProduct as any);
      jest.spyOn(mockProduct, 'deleteOne').mockResolvedValueOnce({} as any);

      const result = await service.remove('someId');
      expect(result).toEqual({ message: 'Product has been deleted' });
    });
  });
});
