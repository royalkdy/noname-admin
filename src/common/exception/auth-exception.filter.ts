import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthLoggerService } from '@/common/logger/logger.service';
import dayjs from '@/common/utils/dayjs.util';
import { ErrorCode } from '../error-code';

interface ExceptionResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

@Catch(HttpException)
export class AuthExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AuthLoggerService) {}
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode: string = 'Internal server error';
    const body: unknown = request.body ?? {};
    const dateTime: string = dayjs().format('YYYY-MM-DD HH:mm:ss');

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
    }

    //브라우저 자동 요청 무시
    const ignoredPaths = ['/.well-known', '/favicon.ico'];

    const shouldIgnore = ignoredPaths.some((path) =>
      request.url.startsWith(path),
    );

    //TODO: Auth 구현이후 UserID 추가
    if (!shouldIgnore) {
      this.logger.error(
        `[${status}] ${dateTime} method:${request.method}, url:${request.url}, errorCode:${JSON.stringify(errorCode)}, body:${JSON.stringify(body)}`,
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
    });
  }
}
