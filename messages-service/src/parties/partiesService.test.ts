import {
  BrokerClient,
  createBrokerClientMock,
  createRandomGeneratorMock,
} from '@chttrbx/common';
import { createPartiesService, PartiesService } from './partiesService';
import {
  createMembersRepositoryMock,
  createPartiesRepositoryMock,
  createTopicsRepositoryMock,
  MembersRepository,
  MOCK_MEMBER,
  MOCK_PARTY,
  MOCK_PARTY_WITH_MEMBERS_AND_TOPICS,
  MOCK_TOPIC,
  PartiesRepository,
  TopicsRepository,
} from './repositories';

describe('PartiesService', () => {
  let service: PartiesService;
  let partiesRepository: PartiesRepository;
  let topicsRepository: TopicsRepository;
  let membersRepository: MembersRepository;
  let brokerClient: BrokerClient;

  beforeAll(async () => {
    partiesRepository = createPartiesRepositoryMock();
    topicsRepository = createTopicsRepositoryMock();
    membersRepository = createMembersRepositoryMock();
    brokerClient = createBrokerClientMock();

    service = createPartiesService({
      partiesRepository,
      topicsRepository,
      membersRepository,
      brokerClient,
      randomGenerator: createRandomGeneratorMock(),
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a new party', async () => {
    jest.spyOn(partiesRepository, 'findManyByUserId').mockResolvedValue([]);

    jest
      .spyOn(partiesRepository, 'findOneWithMembersAndTopics')
      .mockResolvedValue(MOCK_PARTY_WITH_MEMBERS_AND_TOPICS);

    await expect(
      service.createParty({ name: '' }, { id: '' })
    ).resolves.toEqual(MOCK_PARTY_WITH_MEMBERS_AND_TOPICS);
  });

  it('fetches parties by user ID', async () => {
    jest
      .spyOn(partiesRepository, 'findManyByUserId')
      .mockResolvedValue([MOCK_PARTY]);

    await expect(service.getUserParties({ id: '' })).resolves.toEqual([
      MOCK_PARTY,
    ]);
  });

  it('fetches a party by ID', async () => {
    jest
      .spyOn(partiesRepository, 'findOneWithMembersAndTopics')
      .mockResolvedValue(MOCK_PARTY_WITH_MEMBERS_AND_TOPICS);

    await expect(service.getParty('', { id: '' })).resolves.toEqual(
      MOCK_PARTY_WITH_MEMBERS_AND_TOPICS
    );
  });

  it('throws exception if party not found', async () => {
    jest
      .spyOn(partiesRepository, 'findOneWithMembersAndTopics')
      .mockResolvedValue(null);

    await expect(service.getParty('', { id: '' })).rejects.toThrow(
      'Party not found'
    );
  });

  it('adds a new member to a party', async () => {
    jest
      .spyOn(partiesRepository, 'findOneWithMembersAndTopics')
      .mockResolvedValue(MOCK_PARTY_WITH_MEMBERS_AND_TOPICS);

    const spy = jest.spyOn(brokerClient, 'publish');

    await expect(
      service.joinParty(
        '',
        { token: MOCK_PARTY_WITH_MEMBERS_AND_TOPICS.inviteToken },
        { id: '' }
      )
    ).resolves.not.toThrow();

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.objectContaining({
          event: 'member:created',
        }),
      })
    );
  });

  it('throws exception on invalid invite token', async () => {
    jest
      .spyOn(partiesRepository, 'findOneWithMembersAndTopics')
      .mockResolvedValue(MOCK_PARTY_WITH_MEMBERS_AND_TOPICS);

    await expect(
      service.joinParty('', { token: 'invalid' }, { id: '' })
    ).rejects.toThrow('Invalid invite token');
  });

  it('throws exception if joining a party as a member', async () => {
    jest
      .spyOn(partiesRepository, 'findOneWithMembersAndTopics')
      .mockResolvedValue(MOCK_PARTY_WITH_MEMBERS_AND_TOPICS);

    await expect(
      service.joinParty(
        '',
        { token: MOCK_PARTY_WITH_MEMBERS_AND_TOPICS.inviteToken },
        { id: MOCK_MEMBER.userId }
      )
    ).rejects.toThrow('Already a member');
  });

  it('removes an existing member from a party', async () => {
    jest
      .spyOn(membersRepository, 'deleteOneByUserId')
      .mockResolvedValue(MOCK_MEMBER);

    const spy = jest.spyOn(brokerClient, 'publish');

    await expect(service.leaveParty('', { id: '' })).resolves.not.toThrow();

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.objectContaining({
          event: 'member:deleted',
        }),
      })
    );
  });

  it('throws exception if leaving a party as a non-member', async () => {
    jest.spyOn(membersRepository, 'deleteOneByUserId').mockResolvedValue(null);

    await expect(service.leaveParty('', { id: '' })).rejects.toThrow(
      'Not a member'
    );
  });

  it('deletes an existing party', async () => {
    jest.spyOn(partiesRepository, 'deleteOne').mockResolvedValue(MOCK_PARTY);

    const spy = jest.spyOn(brokerClient, 'publish');

    await expect(service.deleteParty('', { id: '' })).resolves.not.toThrow();

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.objectContaining({
          event: 'party:deleted',
        }),
      })
    );
  });

  it('creates a new topic', async () => {
    jest.spyOn(topicsRepository, 'insertOne').mockResolvedValue(MOCK_TOPIC);

    await expect(
      service.createTopic({ name: '' }, '', { id: '' })
    ).resolves.toEqual(
      expect.objectContaining({
        id: MOCK_TOPIC.id,
      })
    );
  });

  it('deletes an existing topic', async () => {
    jest.spyOn(topicsRepository, 'deleteOne').mockResolvedValue(MOCK_TOPIC);

    const spy = jest.spyOn(brokerClient, 'publish');

    await expect(
      service.deleteTopic('', '', { id: '' })
    ).resolves.not.toThrow();

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.objectContaining({
          event: 'topic:deleted',
        }),
      })
    );
  });

  it('throws exception if topic not found', async () => {
    jest.spyOn(topicsRepository, 'deleteOne').mockResolvedValue(null);

    await expect(service.deleteTopic('', '', { id: '' })).rejects.toThrow(
      'Topic not found'
    );
  });
});
