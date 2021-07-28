export class MemberDeletedEvent {
  type: 'MEMBER_DELETED';
  data: {
    userId: string;
    partyId: string;
  };
}
