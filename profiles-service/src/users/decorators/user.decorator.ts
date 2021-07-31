import { RequestWithUser } from '@chttrbx/jwt';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator((_, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest<RequestWithUser>();
  return req.user;
});
