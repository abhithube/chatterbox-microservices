import { Test, TestingModule } from '@nestjs/testing';
import { PartyRepository } from '../parties/party.repository';
import { MessageRepository } from './message.repository';
import { MessageService } from './message.service';

describe('MessageService', () => {
  let service: MessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: MessageRepository,
          useValue: {},
        },
        {
          provide: PartyRepository,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
