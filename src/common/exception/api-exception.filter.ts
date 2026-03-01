import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@/common/logger/logger.service';
import dayjs from '@/common/utils/dayjs.util';
import { ErrorCode } from '../error-code';

interface ExceptionResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

@Catch()
@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const isDev = this.config.get('NODE_ENV') === 'dev';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode: string = 'Internal server error';
    let stack: string | undefined;
    const body: unknown = request.body ?? {};
    const dateTime: string = dayjs().tz().format('YYYY-MM-DD HH:mm:ss');

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        errorCode = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const message = (exceptionResponse as ExceptionResponse).message;
        errorCode = Array.isArray(message)
          ? message.join(', ')
          : (message ?? ErrorCode.UNKNOWN_ERROR);
      } else {
        errorCode = ErrorCode.UNKNOWN_ERROR;
      }
    } else if (exception instanceof Error) {
      stack = exception.stack;
      errorCode = exception.message;
    }
    //브라우저 자동 요청 무시
    const ignoredPaths = ['/.well-known', '/favicon.ico'];

    const shouldIgnore = ignoredPaths.some((path) =>
      request.url.startsWith(path),
    );

    if (isDev && stack) {
      console.error(stack);
    }
    const userId = request.user as number | undefined;
    //TODO: Auth 구현이후 UserID 추가
    if (!shouldIgnore) {
      this.logger.writeApiErrorLog(
        `[API_ERROR] [${status}] ${dateTime} UID:${userId ?? ''} method:${request.method}, url:${request.url}, errorCode:${JSON.stringify(errorCode)}, body:${JSON.stringify(body)}`,
      );
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      path: request.url,
      method: request.method,
      body,
      errorCode,
      dateTime,
      ...(isDev && { stack }),
    });
  }
}
