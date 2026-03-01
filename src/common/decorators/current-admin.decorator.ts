import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const CurrentAdmin = createParamDecorator(
  (_: unknown, context: ExecutionContext): Express.User => {
    const request = context.switchToHttp().getRequest<Request>();
    return request.user as Express.User;
  },
);
