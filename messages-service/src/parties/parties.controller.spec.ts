import { Test, TestingModule } from '@nestjs/testing';
import { PartiesController } from './parties.controller';
import { PartiesService } from './parties.service';

describe('PartiesController', () => {
  let controller: PartiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartiesController],
      providers: [
        {
          provide: PartiesService,
          useValue: {
            getAllParties: jest.fn(),
            getParty: jest.fn(),
            createParty: jest.fn(),
            joinParty: jest.fn(),
            leaveParty: jest.fn(),
            deleteParty: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PartiesController>(PartiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
