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
          useValue: {
            party: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
            topic: {
              create: jest.fn(),
              delete: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
            },
            member: {
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: 'PARTIES_CLIENT',
          useValue: {
            emit: jest.fn(),
          },
        },
        {
          provide: 'TOPICS_CLIENT',
          useValue: {
            emit: jest.fn(),
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
