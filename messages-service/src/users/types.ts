import { User } from './models';

export type UserDto = Omit<User, 'pk'>;
