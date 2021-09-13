import { HttpException } from './HttpException';

export class ForbiddenException extends HttpException {
  constructor(message = 'User not authorized') {
    super(403, message);
  }
}
