import { Container, Token } from 'typedi';
import { JwtOptions } from './interfaces';

export const JWT_OPTIONS = new Token<JwtOptions>('jwt-options');

export const configureJwt = (options: JwtOptions): void => {
  Container.set(JWT_OPTIONS, options);
};
