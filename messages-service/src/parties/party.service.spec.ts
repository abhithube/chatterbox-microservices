import { KafkaService } from '@chttrbx/kafka';
import { Test, TestingModule } from '@nestjs/testing';
import { PartyRepository } from './party.repository';
import { PartyService } from './party.service';

describe('PartyService', () => {
  let service: PartyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartyService,
        {
          provide: KafkaService,
          useValue: {
            publish: jest.fn(),
          },
        },
        {
          provide: PartyRepository,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<PartyService>(PartyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
