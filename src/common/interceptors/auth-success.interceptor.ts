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

    const adminInfo = { ...request.body };
    delete adminInfo.password;

    return next.handle().pipe(
      tap((data) => {
        const logDateTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
        const requestData = JSON.stringify(adminInfo);
        const responseData = JSON.stringify(data);
        const adminAccount = adminInfo.email ?? 'ANONYMOUS';
        let logMessage = `[AUTH_ACTION] ${logDateTime} ADMIN_ACCOUNT:${adminAccount} path:${request.url} method:${request.method} `;

        if (request.method === 'POST') logMessage += `request:${requestData} `;

        logMessage += `response:${responseData}`;

        console.log(logMessage);
        this.logger.writeActionLog(logMessage);
      }),
      map((data) => ({
        success: true,
        data,
        dateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      })),
    );
  }
}
