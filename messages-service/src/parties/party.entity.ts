import { Column, Entity, Index, ObjectID, ObjectIdColumn } from 'typeorm';

class Topic {
  @Column()
  id: string;

  @Column()
  name: string;
}

class User {
  @Column()
  id: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  avatarUrl: string;
}

@Entity({ name: 'parties' })
export class Party {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column()
  @Index({ unique: true })
  id: string;

  @Column()
  name: string;

  @Column()
  inviteToken: string;

  @Column(() => Topic)
  topics: Topic[];

  @Column(() => User)
  users: User[];
}
