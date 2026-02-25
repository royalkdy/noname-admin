import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import {
  LoggerService,
  AuthLoggerService,
} from '@/common/logger/logger.service';
import { GlobalExceptionFilter } from '@/common/exception/global-exception.filter';
import { SuccessResponseInterceptor } from './interceptors/success-response.interceptor';

@Module({
  providers: [
    LoggerService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SuccessResponseInterceptor,
    },
    AuthLoggerService,
  ],
  exports: [LoggerService, AuthLoggerService],
})
export class CommonModule {}
