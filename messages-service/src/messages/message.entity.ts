import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ObjectID,
  ObjectIdColumn,
} from 'typeorm';

class User {
  @Column()
  id: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  avatarUrl?: string;
}

@Entity({ name: 'messages' })
export class Message {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column()
  @Index({ unique: true })
  id: string;

  @Column()
  topicIndex: number;

  @Column()
  body: string;

  @Column(() => User)
  user: User;

  @Column()
  topicId: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;
}
