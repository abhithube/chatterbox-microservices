import { Column, Entity, Index, ObjectID, ObjectIdColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column()
  @Index({ unique: true })
  id: string;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ nullable: true })
  password?: string;

  @Column()
  verified: boolean;

  @Column()
  verificationToken: string;

  @Column()
  resetToken: string;
}
