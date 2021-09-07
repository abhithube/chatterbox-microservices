import { HttpException } from './HttpException';

export class InternalServerException extends HttpException {
  constructor(message = 'Internal server error') {
    super(500, message);
  }
}
