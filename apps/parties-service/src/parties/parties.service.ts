import {
  BadRequestException,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@parties-service/users';
import { randomUUID } from 'crypto';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePartyDto, CreateTopicDto } from './dto';
import { Party, PartyDocument, Topic, TopicDocument } from './schemas';

@Injectable()
export class PartiesService implements OnModuleInit {
  constructor(
    @InjectModel(Party.name) private partyModel: Model<PartyDocument>,
    @InjectModel(Topic.name) private topicModel: Model<TopicDocument>,
    @Inject('KAFKA_CLIENT') private client: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.client.connect();
  }

  async createParty(
    { name }: CreatePartyDto,
    userId: string,
  ): Promise<PartyDocument> {
    const party = new this.partyModel({
      name,
      inviteToken: randomUUID(),
      topics: [],
      admin: userId,
      members: [],
    });

    await party.save();

    this.client.emit('parties', {
      key: party.id,
      value: { event: 'party:created', data: party },
    });

    await this.createMember(party.id, userId, party.inviteToken);
    await this.createTopic({ name: 'general' }, party.id);

    return this.partyModel
      .findById(party.id)
      .populate('topics')
      .populate('members')
      .exec();
  }

  async getPartiesByUserId(userId: string): Promise<PartyDocument[]> {
    return this.partyModel.find({ members: { $in: userId } }).exec();
  }

  async getPartyById(partyId: string): Promise<PartyDocument> {
    if (!isValidObjectId(partyId))
      throw new BadRequestException('Invalid party ID');

    return this.partyModel
      .findById(partyId)
      .populate('topics')
      .populate('members')
      .exec();
  }

  async createMember(id: string, userId: string, inviteToken: string) {
    const party = await this.partyModel.findOne({ id, inviteToken }).exec();

    if ((party.members as unknown as string[]).includes(userId)) return;

    party.members.push(userId as unknown as User);
    await party.save();

    this.client.emit('parties', {
      key: id,
      value: { event: 'member:created', data: { partyId: id, userId } },
    });
  }

  async deleteMember(id: string, userId: string) {
    const party = await this.partyModel.findById(id).exec();

    if (!(party.members as unknown as string[]).includes(userId)) return;

    party.members = party.members.filter((user: unknown) => user !== userId);
    await party.save();

    this.client.emit('parties', {
      key: id,
      value: { event: 'member:deleted', data: { partyId: id, userId } },
    });
  }

  async createTopic(
    { name }: CreateTopicDto,
    partyId: string,
  ): Promise<TopicDocument> {
    const topic = new this.topicModel({
      name,
    });

    await topic.save();

    await this.partyModel.findByIdAndUpdate(partyId, {
      $addToSet: { topics: [topic.id] },
    });

    this.client.emit('parties', {
      key: partyId,
      value: { event: 'topic:created', data: topic },
    });

    return topic;
  }
}
