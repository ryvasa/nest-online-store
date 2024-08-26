import { Test, TestingModule } from '@nestjs/testing';
import { RedicetController } from './redicet.controller';
import { RedicetService } from './redicet.service';

describe('RedicetController', () => {
  let controller: RedicetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RedicetController],
      providers: [RedicetService],
    }).compile();

    controller = module.get<RedicetController>(RedicetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
