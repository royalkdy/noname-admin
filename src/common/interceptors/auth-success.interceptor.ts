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

interface ApiResponse<T> {
  success: boolean;
  data: T;
  dateTime: string;
}

@Injectable()
export class AuthResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  constructor(private readonly logger: LoggerService) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();

    let body: Record<string, unknown> = {};
    let adminEmail: string = '';
    if (typeof request.body === 'object' && request.body !== null) {
      body = { ...(request.body as Record<string, unknown>) };
      delete body['password'];

      if ('email' in body && typeof body.email === 'string') {
        adminEmail = body.email;
      }
    }

    const requestTime = dayjs().tz();
    const logMessage =
      'AUTH:[REQUEST] ' +
      JSON.stringify({
        id: request.requestId,
        date: requestTime.format('YYYY-MM-DD HH:mm:ss'),
        account: adminEmail,
        path: request.path,
        request: body,
      }) +
      '\n';
    // Request
    console.log(logMessage);
    this.logger.writeAuthLog(logMessage);

    return next.handle().pipe(
      map((data) => {
        const responseTime = dayjs().tz();
        const elapsedTimeMs = responseTime.diff(requestTime, 'millisecond');
        const logMessage =
          'AUTH:[RESPONSE] ' +
          JSON.stringify({
            id: request.requestId,
            date: responseTime.format('YYYY-MM-DD HH:mm:ss'),
            account: adminEmail,
            path: request.path,
            response: data,
            elapsedTimeMs,
          }) +
          '\n';
        console.log(logMessage);
        this.logger.writeAuthLog(logMessage);

        return {
          success: true,
          data,
          dateTime: responseTime.format('YYYY-MM-DD HH:mm:ss'),
        };
      }),
    );
  }
}
