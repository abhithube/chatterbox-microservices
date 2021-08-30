import { Token } from 'typedi';
import { JwtOptions } from './interfaces';

export const JWT_OPTIONS = new Token<JwtOptions>('JWT_OPTIONS');
