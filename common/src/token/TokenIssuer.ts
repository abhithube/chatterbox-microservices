import { CurrentUser } from '../api';

export interface TokenIssuer {
  generate(user: CurrentUser, expiresIn?: string | number): string;
  validate(token: string): CurrentUser;
}
