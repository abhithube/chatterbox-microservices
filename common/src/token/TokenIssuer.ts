import { CurrentUser } from '../shared';

export interface TokenIssuer {
  generate(user: CurrentUser, expiresIn?: string | number): string;
  validate(token: string): CurrentUser;
}
