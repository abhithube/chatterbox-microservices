import {
  CacheManager,
  createBrokerClientMock,
  RandomGenerator,
  TokenIssuer,
} from '@chttrbx/common';
import { asFunction, asValue } from 'awilix';
import { Application } from 'express';
import { Client } from 'pg';
import request from 'supertest';
import { configureContainer } from '../src/container';
import {
  CreatePartyDto,
  CreateTopicDto,
  MembersRepository,
  PartiesRepository,
  Party,
  Topic,
  TopicsRepository,
} from '../src/parties';
import { User, UsersRepository } from '../src/users';

const createPartyDto: CreatePartyDto = {
  name: 'party',
};

const createTopicDto: CreateTopicDto = {
  name: 'topic',
};

describe('Parties', () => {
  let app: Application;

  let dbClient: Client;
  let partiesRepository: PartiesRepository;
  let topicsRepository: TopicsRepository;
  let usersRepository: UsersRepository;
  let membersRepository: MembersRepository;
  let cacheManager: CacheManager;
  let tokenIssuer: TokenIssuer;
  let randomGenerator: RandomGenerator;

  let party: Party;
  let topic: Topic;
  let member: User;
  let nonMember: User;

  let memberToken: string;
  let nonMemberToken: string;

  beforeAll(async () => {
    const container = await configureContainer();

    dbClient = container.resolve('dbClient');
    await dbClient.end();

    const configManager = container.resolve('configManager');
    cacheManager = container.resolve('cacheManager');

    const databaseUrl = configManager.get('DATABASE_URL');
    if (!databaseUrl) {
      process.exit(1);
    }

    dbClient = new Client(databaseUrl);
    await dbClient.connect();

    container.register({
      dbClient: asValue(dbClient),
      brokerClient: asFunction(createBrokerClientMock).singleton(),
    });

    app = container.resolve('app');

    partiesRepository = container.resolve('partiesRepository');
    topicsRepository = container.resolve('topicsRepository');
    membersRepository = container.resolve('membersRepository');
    usersRepository = container.resolve('usersRepository');
    tokenIssuer = container.resolve('tokenIssuer');
    randomGenerator = container.resolve('randomGenerator');
  });

  beforeEach(async () => {
    party = await partiesRepository.insertOne({
      id: randomGenerator.generate(),
      name: createPartyDto.name,
      inviteToken: randomGenerator.generate(),
    });

    topic = await topicsRepository.insertOne({
      id: randomGenerator.generate(),
      name: createTopicDto.name,
      partyId: party.id,
    });

    nonMember = await usersRepository.insertOne({
      id: randomGenerator.generate(),
      username: 'nonMember',
      avatarUrl: null,
    });

    member = await usersRepository.insertOne({
      id: randomGenerator.generate(),
      username: 'member',
      avatarUrl: null,
    });

    await membersRepository.insertOne({
      userId: member.id,
      partyId: party.id,
    });

    memberToken = tokenIssuer.generate({
      id: member.id,
    });

    nonMemberToken = tokenIssuer.generate({
      id: nonMember.id,
    });
  });

  afterEach(async () => {
    await partiesRepository.deleteMany();
    await usersRepository.deleteMany();
  });

  afterAll(async () => {
    await dbClient.end();
    await cacheManager.disconnect();
  });

  it('POST /parties - creates a new party', async () => {
    const res = await request(app)
      .post('/parties')
      .send(createPartyDto)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(
      expect.objectContaining({
        name: createPartyDto.name,
      })
    );
  });

  it("GET /parties/@me - fetches a user's parties", async () => {
    const res = await request(app)
      .get('/parties/@me')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: party.id,
        }),
      ])
    );
  });

  it('GET /parties/:id - fetches a party by ID', async () => {
    const res = await request(app)
      .get(`/parties/${party.id}`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        id: party.id,
        members: expect.arrayContaining([
          expect.objectContaining({
            id: member.id,
          }),
        ]),
      })
    );
  });

  it('POST /parties/:id/join - adds a member to a party', async () => {
    const res = await request(app)
      .post(`/parties/${party.id}/join`)
      .send({ token: party.inviteToken })
      .set('Authorization', `Bearer ${nonMemberToken}`);

    expect(res.statusCode).toBe(200);

    const m = await membersRepository.findOne(nonMember.id, party.id);

    expect(m).not.toBeNull();
  });

  it('POST /parties/:id/leave - removes a member from a party', async () => {
    const res = await request(app)
      .post(`/parties/${party.id}/leave`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.statusCode).toBe(200);

    const m = await membersRepository.findOne(member.id, party.id);

    expect(m).toBeNull();
  });

  it('DELETE /parties/:id - deletes a party by ID', async () => {
    const res = await request(app)
      .delete(`/parties/${party.id}`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.statusCode).toBe(200);

    const p = await partiesRepository.findOne(party.id);

    expect(p).toBeNull();
  });

  it('POST /parties/:id/topics - adds a topic to a party', async () => {
    const res = await request(app)
      .post(`/parties/${party.id}/topics`)
      .send(createTopicDto)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(
      expect.objectContaining({
        name: topic.name,
      })
    );
  });

  it('GET /parties/:id/topics/:topicId/messages - fetches up to 50 messages from a topic', async () => {
    const res = await request(app)
      .get(`/parties/${party.id}/topics/${topic.id}/messages`)
      .send(createTopicDto)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('DELETE /parties/:id/topics/:topicId - removes a topic to a party', async () => {
    const res = await request(app)
      .delete(`/parties/${party.id}/topics/${topic.id}`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.statusCode).toBe(200);

    const t = await topicsRepository.findOne(topic.id);

    expect(t).toBeNull();
  });
});
