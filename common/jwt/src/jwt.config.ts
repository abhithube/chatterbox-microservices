import { Container } from 'typedi';
import { JWT_OPTIONS } from './constants';
import { JwtOptions } from './interfaces';

export function configureJwt(options: JwtOptions): void {
  Container.set(JWT_OPTIONS, options);
}
