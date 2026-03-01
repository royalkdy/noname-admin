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
import { AdminRole } from '../../auth/types/admin-role.enum';
import { SKIP_API_LOG } from '../decorators/skip-api-log.decorator';
import { Reflector } from '@nestjs/core/services/reflector.service';

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

    const admin = request.user as { id: number; role: AdminRole } | undefined;

    return next.handle().pipe(
      tap((data) => {
        //로그 스킵 (auth interceptor에서 처리함)
        if (skip) return;

        const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

        const safeBody = { ...request.body };
        delete safeBody.password;

        let logData = {
          date: now,
          adminId: admin?.id ?? 'ANONYMOUS',
          path: request.url,
          method: request.method,
          body: safeBody,
          response: data,
        };

        const logMessage = '[API_ACTION] ' + JSON.stringify(logData);
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
