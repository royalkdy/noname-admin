import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

// TODO: 커스텀 데코레이터 만드는법 공부
export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext): Express.User => {
    const request = context.switchToHttp().getRequest<Request>();
    return request.user as Express.User;
  },
);
