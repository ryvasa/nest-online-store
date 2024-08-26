import { Test, TestingModule } from '@nestjs/testing';
import { RedicetService } from './redicet.service';

describe('RedicetService', () => {
  let service: RedicetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedicetService],
    }).compile();

    service = module.get<RedicetService>(RedicetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
