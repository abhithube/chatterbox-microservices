import { KafkaService, SubscribeTo } from '@chttrbx/kafka';
import { Controller } from '@nestjs/common';
import { MemberDto } from './dto/member.dto';
import { PartyCreatedDto } from './dto/party-created.dto';
import { PartyDto } from './dto/party.dto';
import { TopicDto } from './dto/topic.dto';
import { PartiesService } from './parties.service';

@Controller('parties')
export class PartiesController {
  constructor(
    private partiesService: PartiesService,
    private kafka: KafkaService,
  ) {}

  onModuleInit(): void {
    this.kafka.bindConsumer<PartiesController>('parties', this);
  }

  @SubscribeTo({
    topic: 'parties',
    event: 'PARTY_CREATED',
  })
  async partyCreatedHandler({
    party,
    topic,
    userId,
  }: PartyCreatedDto): Promise<void> {
    await this.partiesService.saveTopic(topic);
    return this.partiesService.saveMember({ userId, partyId: party.id });
  }

  @SubscribeTo({
    topic: 'parties',
    event: 'PARTY_DELETED',
  })
  async partyDeletedHandler({ id }: PartyDto): Promise<void> {
    return this.partiesService.removePartyTopics(id);
  }

  @SubscribeTo({
    topic: 'parties',
    event: 'MEMBER_CREATED',
  })
  async memberCreatedHandler(memberDto: MemberDto): Promise<void> {
    return this.partiesService.saveMember(memberDto);
  }

  @SubscribeTo({
    topic: 'parties',
    event: 'MEMBER_DELETED',
  })
  async memberDeletedHandler(memberDto: MemberDto): Promise<void> {
    return this.partiesService.removeMember(memberDto);
  }

  @SubscribeTo({
    topic: 'parties',
    event: 'TOPIC_CREATED',
  })
  async topicCreatedHandler(topicDto: TopicDto): Promise<void> {
    return this.partiesService.saveTopic(topicDto);
  }

  @SubscribeTo({
    topic: 'parties',
    event: 'TOPIC_DELETED',
  })
  async topicDeletedHandler({ id }: Pick<TopicDto, 'id'>): Promise<void> {
    return this.partiesService.removeTopic(id);
  }
}
