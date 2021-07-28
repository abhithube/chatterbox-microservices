export class UserDeletedEvent {
  value: {
    type: 'USER_DELETED';
    data: {
      id: string;
    };
  };
}
