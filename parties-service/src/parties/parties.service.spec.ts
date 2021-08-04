import { KafkaService } from '@chttrbx/kafka';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { PartiesService } from './parties.service';

describe('PartiesService', () => {
  let service: PartiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartiesService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: KafkaService,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PartiesService>(PartiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
