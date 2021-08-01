import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from '../interfaces';

export const User = createParamDecorator((_, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest<RequestWithUser>();
  return req.user;
});
