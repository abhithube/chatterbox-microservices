import { Column, Entity, Index, ObjectID, ObjectIdColumn } from 'typeorm';

@Entity({
  name: 'users',
})
export class User {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column()
  @Index({ unique: true })
  id: string;
}
