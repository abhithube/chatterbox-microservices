import { HttpException } from './HttpException';

export class UnauthorizedException extends HttpException {
  constructor(message = 'User not authorized') {
    super(401, message);
  }
}
