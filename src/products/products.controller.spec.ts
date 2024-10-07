import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

describe('ProductsController', () => {
  let productsService: ProductsService;
  let jwtService: JwtService;
  let userService: UsersService;
  let controller: ProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: UsersService,
          useValue: {},
        },
      ],
    }).compile();

    jwtService = module.get<JwtService>(JwtService);
    userService = module.get<UsersService>(UsersService);
    productsService = module.get<ProductsService>(ProductsService);
    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
