import { User } from './user.entity';

export type UserDocument = Omit<User, '_id'>;

export type UserInsertOptions = Pick<User, 'id'>;

export type UserFilterOptions = Partial<User>;
