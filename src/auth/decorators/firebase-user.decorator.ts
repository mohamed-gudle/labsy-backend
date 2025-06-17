import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithDecodedToken } from '../guards/no-user.guard';

export const FirebaseUserDec = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest<RequestWithDecodedToken>();
    return request.user!;
  },
);
