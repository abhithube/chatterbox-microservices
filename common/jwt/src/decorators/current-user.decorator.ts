import { createParamDecorator } from 'routing-controllers';
import { RequestWithUser } from '../interfaces';

export function CurrentUser(options?: {
  required?: boolean;
}): (object: any, method: string, index: number) => void {
  return createParamDecorator({
    required: options && options.required,
    value: ({ request }) => (request as RequestWithUser).user,
  });
}
