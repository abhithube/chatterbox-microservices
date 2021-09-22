import { createRandomGeneratorMock } from '@chttrbx/common';
import { createMessagesService, MessagesService } from './messagesService';
import {
  createMessagesRepositoryMock,
  MessagesRepository,
  MOCK_MESSAGE,
  MOCK_MESSAGE_WITH_USER,
} from './repositories';

describe('MessagesService', () => {
  let service: MessagesService;
  let messagesRepository: MessagesRepository;

  beforeAll(async () => {
    messagesRepository = createMessagesRepositoryMock();

    service = createMessagesService({
      messagesRepository,
      randomGenerator: createRandomGeneratorMock(),
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a new message', async () => {
    jest
      .spyOn(messagesRepository, 'findOneByTopicIdAndDate')
      .mockResolvedValue(MOCK_MESSAGE);

    jest.spyOn(messagesRepository, 'insertOne').mockResolvedValue(MOCK_MESSAGE);

    await expect(
      service.createMessage({ body: '' }, '', { id: '' })
    ).resolves.toEqual(MOCK_MESSAGE_WITH_USER);
  });

  it('fetches messages by topic ID', async () => {
    jest
      .spyOn(messagesRepository, 'findManyByTopicIdAndTopicIndex')
      .mockResolvedValue([MOCK_MESSAGE_WITH_USER]);

    await expect(service.getMessages('')).resolves.toEqual([
      MOCK_MESSAGE_WITH_USER,
    ]);
  });
});
