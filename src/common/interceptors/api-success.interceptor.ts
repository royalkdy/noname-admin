import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { LoggerService } from '../logger/logger.service';
import dayjs from '@/common/utils/dayjs.util';
import { SKIP_API_LOG } from '../decorators/skip-api-log.decorator';
import { Reflector } from '@nestjs/core/services/reflector.service';
import type { AuthenticatedAdmin } from '@/auth/types/auth.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  dateTime: string;
}

@Injectable()
export class ApiResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  constructor(
    private readonly logger: LoggerService,
    private readonly reflector: Reflector,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();

    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_API_LOG, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skip) {
      return next.handle().pipe(
        map((data) => ({
          success: true,
          data,
          dateTime: dayjs().tz().format('YYYY-MM-DD HH:mm:ss'),
        })),
      );
    }

    const adminUser = request.user as AuthenticatedAdmin | undefined;

    const requestBody =
      typeof request.body === 'object' && request.body !== null
        ? (request.body as Record<string, unknown>)
        : {};

    const requestTime = dayjs().tz();
    const logMessage =
      'API:[REQUEST] ' +
      JSON.stringify({
        id: request.requestId,
        date: requestTime.format('YYYY-MM-DD HH:mm:ss'),
        account: adminUser?.email ?? 'ANONYMOUS',
        path: request.path,
        request: requestBody,
      }) +
      '\n';
    // Request
    console.log(logMessage);
    this.logger.writeApiLog(logMessage);

    return next.handle().pipe(
      map((data) => {
        const responseTime = dayjs().tz();
        const elapsedTimeMs = responseTime.diff(requestTime, 'millisecond');
        const logMessage =
          'API:[RESPONSE] ' +
          JSON.stringify({
            id: request.requestId,
            date: responseTime.format('YYYY-MM-DD HH:mm:ss'),
            account: adminUser?.email ?? 'ANONYMOUS',
            path: request.path,
            response: data,
            elapsedTimeMs,
          }) +
          '\n';
        console.log(logMessage);
        this.logger.writeApiLog(logMessage);

        return {
          success: true,
          data,
          dateTime: responseTime.format('YYYY-MM-DD HH:mm:ss'),
        };
      }),
    );
  }
}
