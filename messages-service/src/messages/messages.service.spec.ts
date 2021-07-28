import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { MessagesService } from './messages.service';

describe('MessagesService', () => {
  let service: MessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: PrismaClient,
          useValue: {
            message: {
              create: jest.fn(),
            },
            party: {
              findUnique: jest.fn(),
            },
            topic: {
              findUnique: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
            },
            member: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
