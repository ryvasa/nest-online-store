import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { Cart } from './schema/cart.schema';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';

describe('CartService', () => {
  let service: CartService;
  let cartModel: Model<Cart>;

  const CART_MODEL_TOKEN = getModelToken('Cart');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: CART_MODEL_TOKEN,
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            findOneAndUpdate: jest.fn(),
            updateOne: jest.fn(),
            aggregate: jest.fn(),
          },
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
});
