export class MemberCreatedEvent {
  type: 'MEMBER_CREATED';
  data: {
    userId: string;
    partyId: string;
  };
}
