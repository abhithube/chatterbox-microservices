import { HttpException } from './HttpException';

export class NotFoundException extends HttpException {
  constructor(message = 'Not found') {
    super(404, message);
  }
}
