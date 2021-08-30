import { Container } from 'typedi';
import { JWT_OPTIONS } from './constants';
import { JwtOptions } from './interfaces';
import { JwtService } from './jwt.service';

export function configureJwt(options: JwtOptions): JwtService {
  Container.set(JWT_OPTIONS, options);

  return new JwtService();
}
