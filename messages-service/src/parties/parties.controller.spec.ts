import { Test, TestingModule } from '@nestjs/testing';
import { PartiesController } from './parties.controller';
import { PartiesService } from './parties.service';

describe('PartiesController', () => {
  let controller: PartiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartiesController],
      providers: [PartiesService],
    }).compile();

    controller = module.get<PartiesController>(PartiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
