import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import {
  LoggerService,
  AuthLoggerService,
} from '@/common/logger/logger.service';
import { GlobalExceptionFilter } from '@/common/exception/api-exception.filter';
import { ApiResponseInterceptor } from './interceptors/api-success.interceptor';

@Module({
  providers: [
    LoggerService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiResponseInterceptor,
    },
    AuthLoggerService,
  ],
  exports: [LoggerService, AuthLoggerService],
})
export class CommonModule {}
