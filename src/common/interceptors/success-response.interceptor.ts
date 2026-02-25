import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { LoggerService } from '../logger/logger.service';
import dayjs from 'dayjs';

interface ApiResponse<T> {
  success: boolean;
  // statusCode: number;
  // path: string;
  // method: string;
  data: T;
  dateTime: string;
}

@Injectable()
export class SuccessResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  constructor(private readonly logger: LoggerService) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const http = context.switchToHttp();
    // const response = http.getResponse<Response>();
    const request = http.getRequest<Request>();

    const userId = request.user as number | undefined;
    return next.handle().pipe(
      tap((data) => {
        const logDateTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
        const requestData = JSON.stringify(request.body);
        const responseData = JSON.stringify(data);
        const uid = userId ?? 'ANONYMOUS';
        let debugLogMessage = `${logDateTime} UID:${uid} path:${request.url} method:${request.method} `;
        if (request.method === 'POST')
          debugLogMessage += `request:${requestData} `;
        debugLogMessage += `response:${responseData}`;
        this.logger.userActionLog(debugLogMessage);
      }),
      map((data) => ({
        success: true,
        data,
        dateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      })),
    );
  }
}
