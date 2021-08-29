import { JwtOptions } from './interfaces';
import { JwtService } from './jwt.service';

export const configureJwt = (options: JwtOptions): JwtService =>
  new JwtService(options);
