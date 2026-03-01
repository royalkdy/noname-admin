import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction) {
    const requestId =
      Date.now().toString(36).slice(-4) +
      Math.random().toString(36).slice(2, 6);

    request.requestId = requestId;
    response.setHeader('X-Request-Id', requestId);

    next();
  }
}
